
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { LOCAL_PROJECT, TemplateClassification, CreateNewBoardResponse, GENERIC_RESTART } from 'constellation-common/datatypes';
import { send } from "../../communications/RestComms";
import { E27, showError } from "../../ErrorLogger";

export class CreateNewBoardAction extends Action {

    private projectId: string;
    private template: TemplateClassification[];
    private boardOrFileName: string; // Remote boards get a board name. Local boards get a filepath.

    constructor(projectId: string, template: TemplateClassification[], boardOrFileName: string) {
        super();
        this.projectId = projectId;
        this.boardOrFileName = boardOrFileName;
        this.template = template;
    }

    submit(): void {
        if (this.projectId !== LOCAL_PROJECT) {
            // If remote project, send message over REST.
            let remoteProject = useStore().getters.getRemoteProjectById(this.projectId);
            if (remoteProject) {
                send<CreateNewBoardResponse>({
                    httpMethod: 'post',
                    baseUrl: remoteProject.serverUrl,
                    endpoint: '/board',
                    creds: remoteProject.credentials,
                    data: {
                        boardOrFileName: this.boardOrFileName,
                        template: this.template,
                    },
                    callback: (resp) => this.processResponse(resp.data)
                });
            } else {
                showError(E27, [GENERIC_RESTART]);
            }
        } else {
            // If local project, make the IPC request
            window.config.createNewBoard({
                boardOrFileName: this.boardOrFileName,
                template: this.template,
            }).then((resp) => this.processResponse(resp));
        }
    }

    processResponse(resp: CreateNewBoardResponse): void {
        if ('errorCode' in resp) {
            this.errorCallback(resp);

        } else {
            useStore().dispatch('addBoardToProject', {
                projectId: this.projectId,
                boardData: resp,
            });

            if (this.successCallback)
                this.successCallback(resp);
        }
    }

}
