
import { useStore } from "../../store/store";
import { Action } from "../Action";

import { RemoteProject } from "../../../../../common/DataTypes/FileDataTypes";
import { GetBoardTemplatesResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { send } from "../../communications/RestComms";

export class GetBoardTemplatesAction extends Action {

    private remoteProject?: RemoteProject;

    /** If remoteProject is undefined, then will fetch local data. */
    constructor(remoteProject?: RemoteProject) {
        super();

        this.remoteProject = remoteProject;
    }

    submit(callback: (resp: GetBoardTemplatesResponse) => void): void {
        if (this.remoteProject) {
            // If remote project, send message over REST.
            send<GetBoardTemplatesResponse>({
                httpMethod: 'get',
                endpoint: `${this.remoteProject.serverUrl}/project/templates`,
                creds: this.remoteProject.credentials,
                callback: (resp) => callback(resp.data)
            });
        } else {
            // If local project, make the IPC request
            window.config.getTemplates()
                .then((resp) => callback(resp));
        }
    }

    processResponse(resp: GetBoardTemplatesResponse): void {
        // No-op - handled through a callback given to submit()
    }

}
