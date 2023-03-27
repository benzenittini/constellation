
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { DeleteBoardResponse, GENERIC_RESTART } from "../../../../../common/DataTypes/ActionDataTypes";
import { send } from "../../communications/RestComms";
import { LOCAL_PROJECT } from "../../../../../common/DataTypes/BoardDataTypes";
import { E28, showError } from "../../../common/ErrorLogger";

export class DeleteBoardAction extends Action {

    private projectId: string;
    private boardId: string;
    private deleteFile?: boolean;

    constructor(projectId: string, boardId: string, deleteFile?: boolean) {
        super();

        this.projectId = projectId;
        this.boardId = boardId;
        this.deleteFile = deleteFile;
    }

    submit(): void {
        if (this.projectId !== LOCAL_PROJECT) {
            // If remote project, send message over REST.
            let remoteProject = useStore().getters.getRemoteProjectById(this.projectId);
            if (remoteProject) {
                send<DeleteBoardResponse>({
                    httpMethod: 'delete',
                    baseUrl: remoteProject.serverUrl,
                    endpoint: `/board/${this.boardId}`,
                    creds: remoteProject.credentials,
                    callback: (resp) => this.processResponse(resp.data)
                });
            } else {
                showError(E28, [GENERIC_RESTART]);
            }
        } else {
            // If local project, make the IPC request
            window.config.deleteBoard({
                boardId: this.boardId,
                deleteFile: this.deleteFile,
            }).then((resp) => this.processResponse(resp));
        }
    }

    processResponse(resp: DeleteBoardResponse): void {
        if ('errorCode' in resp) {
            this.errorCallback(resp);

        } else {
            useStore().dispatch('removeBoardFromProject', {
                projectId: resp.projectId,
                boardId: resp.boardId,
            });

            if (this.successCallback)
                this.successCallback(resp);
        }
    }

}
