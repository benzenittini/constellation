
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { DeleteBoardResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { send } from "../../communications/RestComms";
import { LOCAL_PROJECT } from "../../../../../common/DataTypes/BoardDataTypes";

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
            // TODO-const
            // // If remote project, send message over REST.
            // let remoteProject = useStore().getters.getRemoteProjectById(this.projectId);
            // if (remoteProject) {
            //     send<DeleteBoardResponse>({
            //         httpMethod: 'post',
            //         endpoint: `${remoteProject.serverUrl}/board`,
            //         creds: remoteProject.credentials,
            //         data: {
            //             boardOrFileName: this.boardOrFileName,
            //             template: this.template,
            //         },
            //         callback: (resp) => this.processResponse(resp.data)
            //     });
            // } else {
            //     // TODO-const : show an error, recommend a reload.
            // }
        } else {
            // If local project, make the IPC request
            window.config.deleteBoard({
                boardId: this.boardId,
                deleteFile: this.deleteFile,
            }).then((resp) => this.processResponse(resp));
        }
    }

    processResponse({ wasSuccessful, projectId, boardId }: DeleteBoardResponse): void {
        if (wasSuccessful) {
            useStore().dispatch('removeBoardFromProject', { projectId, boardId });
        }
    }

}
