
import { Action } from "../Action";

import { RemoteProject, GetBoardTemplatesResponse } from 'constellation-common/datatypes';
import { send } from "../../communications/RestComms";

export class GetBoardTemplatesAction extends Action {

    private remoteProject?: RemoteProject;

    /** If remoteProject is undefined, then will fetch local data. */
    constructor(remoteProject?: RemoteProject) {
        super();

        this.remoteProject = remoteProject;
    }

    submit(): void {
        if (this.remoteProject) {
            // If remote project, send message over REST.
            send<GetBoardTemplatesResponse>({
                httpMethod: 'get',
                baseUrl: this.remoteProject.serverUrl,
                endpoint: '/project/templates',
                creds: this.remoteProject.credentials,
                callback: (resp) => this.processResponse(resp.data)
            });
        } else {
            // If local project, make the IPC request
            window.config.getTemplates()
                .then((resp) => this.processResponse(resp));
        }
    }

    processResponse(resp: GetBoardTemplatesResponse): void {
        if ('errorCode' in resp) {
            this.errorCallback(resp);

        } else {
            // No-op - all processing is done inside the callback.
            if (this.successCallback)
                this.successCallback(resp);
        }
    }

}
