
import { GetRemoteProjectsResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { Action } from "../Action";

export class GetRemoteProjectsAction extends Action {

    constructor() {
        super();
    }

    submit(callback: (data: GetRemoteProjectsResponse) => void): void {
        // This request never gets sent to the server - list of remote projects is stored locally.
        window.config.getRemoteProjects()
            .then((resp) => callback(resp));
    }

    processResponse(): void {
        // no-op - it's handled in submit's "callback" parameter
    }

}
