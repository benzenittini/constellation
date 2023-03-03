
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { LOCAL_PROJECT, TemplateClassification } from "../../../../../common/DataTypes/BoardDataTypes";
import { CreateNewBoardResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { send } from "../../communications/RestComms";

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
                    endpoint: `${remoteProject.serverUrl}/board`,
                    creds: remoteProject.credentials,
                    data: {
                        boardOrFileName: this.boardOrFileName,
                        template: this.template,
                    },
                    callback: (resp) => this.processResponse(resp.data)
                });
            } else {
                // TODO-const : show an error, recommend a reload.
            }
        } else {
            // If local project, make the IPC request
            window.config.createNewBoard({
                boardOrFileName: this.boardOrFileName,
                template: this.template,
            }).then((resp) => this.processResponse(resp));
        }
    }

    processResponse(boardData: CreateNewBoardResponse): void {
        if (boardData) {
            useStore().dispatch('addBoardToProject', {
                projectId: this.projectId,
                boardData,
            });
        }
    }

}
