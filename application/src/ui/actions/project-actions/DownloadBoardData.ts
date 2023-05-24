
import { Action } from "../Action";

import { RemoteProject, DownloadBoardDataResponse, GENERIC_RESTART } from 'constellation-common/datatypes';
import { send } from "../../communications/RestComms";
import { E41, showError } from "../../ErrorLogger";

export class DownloadBoardDataAction extends Action {

    private remoteProject: RemoteProject;
    private boardId: string;

    constructor(remoteProject: RemoteProject, boardId: string) {
        super();

        this.remoteProject = remoteProject;
        this.boardId = boardId;
    }

    submit(): void {
        if (this.remoteProject) {
            // If remote project, send message over REST.
            send<DownloadBoardDataResponse>({
                httpMethod: 'get',
                baseUrl: this.remoteProject.serverUrl,
                endpoint: `/board/${this.boardId}`,
                creds: this.remoteProject.credentials,
                callback: (resp) => this.processResponse(resp.data)
            });
        } else {
            // Not applicable to local boards
        }
    }

    processResponse(resp: DownloadBoardDataResponse): void {
        if ('errorCode' in resp) {
            this.errorCallback(resp);

        } else {
            // Send data to the main process for saving.
            window.config.saveBoardData({
                boardData: resp.boardData,
                boardName: resp.boardName,
            }).then((resp) => {
                if ('errorCode' in resp) {
                    showError(E41, [resp.message || GENERIC_RESTART]);
                }
            });

            if (this.successCallback)
                this.successCallback(resp);
        }
    }

}
