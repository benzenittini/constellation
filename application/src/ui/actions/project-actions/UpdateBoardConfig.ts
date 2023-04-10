
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { BoardConfig, GENERIC_RESTART, UpdateBoardConfigResponse, LOCAL_PROJECT } from 'constellation-common';
import { send } from "../../communications/RestComms";
import { E30, showError } from "../../ErrorLogger";

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
                    baseUrl: remoteProject.serverUrl,
                    endpoint: `/board/${this.boardId}`,
                    creds: remoteProject.credentials,
                    data: {
                        boardConfig: this.boardConfig,
                    },
                    callback: (resp) => this.processResponse(resp.data)
                });
            } else {
                showError(E30, [GENERIC_RESTART]);
            }
        } else {
            // Local projects cannot be renamed, and there's not currently any other config.
        }
    }

    processResponse(resp: UpdateBoardConfigResponse): void {
        if ('errorCode' in resp) {
            this.errorCallback(resp);

        } else {
            useStore().dispatch('updateBoardConfig', {
                projectId: resp.projectId!,
                boardId: resp.boardId!,
                boardConfig: resp.boardConfig!,
            });

            if (this.successCallback)
                this.successCallback(resp);
        }
    }

}
