
import { useStore } from "../../store/store";
import { Action } from "../Action";

import { RemoteProject } from "../../../../../common/DataTypes/FileDataTypes";
import { GetProjectDataResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { send } from "../../communications/RestComms";

export class GetProjectDataAction extends Action {

    private remoteProject?: RemoteProject;

    /** If remoteProject is undefined, then will fetch local data. */
    constructor(remoteProject?: RemoteProject) {
        super();

        this.remoteProject = remoteProject;
    }

    submit(): void {
        if (this.remoteProject) {
            // If remote project, send message over REST.
            send<GetProjectDataResponse>({
                httpMethod: 'get',
                endpoint: `${this.remoteProject.serverUrl}/project`,
                creds: this.remoteProject.credentials,
                callback: (resp) => this.processResponse(resp.data)
            });
        } else {
            // If local project, make the IPC request
            window.config.getProjectData()
                .then((boards) => this.processResponse(boards));
        }
    }

    processResponse(resp: GetProjectDataResponse): void {
        useStore().dispatch('addProject', resp);
    }

}
