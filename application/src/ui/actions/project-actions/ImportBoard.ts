
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { BoardData, LOCAL_PROJECT } from "../../../../../common/DataTypes/BoardDataTypes";
import { ImportBoardResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { send } from "../../communications/RestComms";

export class ImportBoardAction extends Action {

    private projectId: string;
    private boardName?: string;
    private initialData?: BoardData;

    constructor(projectId: string, boardName?: string, initialData?: BoardData) {
        super();
        this.projectId = projectId;
        this.boardName = boardName;
        this.initialData = initialData;
    }

    submit(): void {
        if (this.projectId !== LOCAL_PROJECT) {
            // If remote project, send message over REST.
            let remoteProject = useStore().getters.getRemoteProjectById(this.projectId);
            if (remoteProject) {
                send<ImportBoardResponse>({
                    httpMethod: 'put',
                    baseUrl: remoteProject.serverUrl,
                    endpoint: '/board',
                    creds: remoteProject.credentials,
                    data: {
                        boardName: this.boardName,
                        initialData: this.initialData,
                    },
                    callback: (resp) => this.processResponse(resp.data)
                });
            } else {
                // TODO-const : show an error, recommend a reload.
            }
        } else {
            // If local project, make the IPC request.
            window.config.importBoard(undefined)
                .then((resp) => this.processResponse(resp));
        }
    }

    processResponse(resp: ImportBoardResponse): void {
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
