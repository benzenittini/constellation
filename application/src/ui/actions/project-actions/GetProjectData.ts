
import { useStore } from "../../store/store";
import { Action } from "../Action";

import { RemoteProject, GetProjectDataResponse } from 'constellation-common/datatypes';
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
                baseUrl: this.remoteProject.serverUrl,
                endpoint: '/project',
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
        if ('errorCode' in resp) {
            this.errorCallback(resp);

        } else {
            const store = useStore();
            store.dispatch('addProject', resp);
            if (this.remoteProject) {
                store.dispatch('registerRemoteProject', { remoteProject: this.remoteProject, projectId: resp.projectId });
            }

            if (this.successCallback)
                this.successCallback(resp);
        }
    }

}
