
import { Action } from "../Action";

import { useStore } from "../../store/store";
import { send } from '../../communications/RestComms';
import { LeaveProjectResponse, RemoveRemoteProjectResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { RemoteProject } from "../../../../../common/DataTypes/FileDataTypes";

export class LeaveProjectAction extends Action {

    private remoteProject: RemoteProject;
    private projectId?: string; // If we can't communicate with the server, we won't have the projectId

    constructor(remoteProject: RemoteProject, projectId?: string) {
        super();

        this.remoteProject = remoteProject;
        this.projectId = projectId;
    }

    submit(): void {
        // Send the remote request to de-auth this user.
        send<LeaveProjectResponse>({
            httpMethod: 'delete',
            baseUrl: this.remoteProject.serverUrl,
            endpoint: '/user',
            creds: this.remoteProject.credentials,
            callback: (resp) => {}
        });

        // Update our local persistence
        window.config.removeRemoteProject({
            remoteProject: this.remoteProject,
        }).then(resp => this.processResponse(resp));
    }

    processResponse(resp: RemoveRemoteProjectResponse): void {
        if ('errorCode' in resp) {
            this.errorCallback(resp);

        } else {
            const store = useStore();
            store.dispatch('deregisterRemoteProject', { remoteProject: this.remoteProject });
            if (this.projectId) {
                store.dispatch('removeProject', this.projectId);
            }

            if (this.successCallback)
                this.successCallback(resp);
        }
    }

}
