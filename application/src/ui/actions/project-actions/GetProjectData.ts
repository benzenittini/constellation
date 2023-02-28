
import { useStore } from "../../store/store";
import { Action } from "../Action";

import { RemoteProject } from "../../../../../common/DataTypes/FileDataTypes";
import { GetProjectDataResponse } from "../../../../../common/DataTypes/ActionDataTypes";

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
            // TODO-const : Send action over REST
            console.log("GetProjectData.submit() not implemented for remote projects");
        } else {
            // If local project, make the IPC request
            window.config.getProjectData()
                .then((boards) => this.processResponse(boards));
        }
    }

    processResponse(resp: GetProjectDataResponse): void {
        useStore().dispatch('addProject', resp);
        // TODO-const : Delete
    }

}
