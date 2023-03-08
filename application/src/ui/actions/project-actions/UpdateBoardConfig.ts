
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { LOCAL_PROJECT } from "../../../../../common/DataTypes/BoardDataTypes";
import { BoardConfig, UpdateBoardConfigResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { send } from "../../communications/RestComms";

export class UpdateBoardConfigAction extends Action {

    private projectId: string;
    private boardId: string;
    private boardConfig: BoardConfig;

    constructor(projectId: string, boardId: string, boardConfig: BoardConfig) {
        super();
        this.projectId = projectId;
        this.boardId = boardId;
        this.boardConfig = boardConfig;
    }

    submit(): void {
        if (this.projectId !== LOCAL_PROJECT) {
            // If remote project, send message over REST.
            let remoteProject = useStore().getters.getRemoteProjectById(this.projectId);
            if (remoteProject) {
                send<UpdateBoardConfigResponse>({
                    httpMethod: 'put',
                    endpoint: `${remoteProject.serverUrl}/board/${this.boardId}`,
                    creds: remoteProject.credentials,
                    data: {
                        boardConfig: this.boardConfig,
                    },
                    callback: (resp) => this.processResponse(resp.data)
                });
            } else {
                // TODO-const : show an error, recommend a reload.
            }
        } else {
            // Local projects cannot be renamed, and there's not currently any other config.
        }
    }

    processResponse(resp: UpdateBoardConfigResponse): void {
        if (resp.wasSuccessful) {
            useStore().dispatch('updateBoardConfig', {
                projectId: resp.projectId!,
                boardId: resp.boardId!,
                boardConfig: resp.boardConfig!,
            });
        }
    }

}
