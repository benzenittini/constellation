
import { GetRemoteProjectsResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { useStore } from "../../store/store";
import { Action } from "../Action";
import { GetProjectDataAction } from "./GetProjectData";

export class GetRemoteProjectsAction extends Action {

    constructor() {
        super();
    }

    submit(): void {
        // This request never gets sent to the server - list of remote projects is stored locally.
        window.config.getRemoteProjects()
            .then((resp) => this.processResponse(resp));
    }

    processResponse(resp: GetRemoteProjectsResponse): void {
        const store = useStore();
        resp.forEach(remote => {
            store.dispatch('registerRemoteProject', {remoteProject: remote});
            new GetProjectDataAction(remote).submit();
        });
    }

}
