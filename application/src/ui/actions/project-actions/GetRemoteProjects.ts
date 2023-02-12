
import { BasicProjectData } from "../../../../../common/DataTypes/BoardDataTypes";
import { Action } from "../Action";

export class GetRemoteProjectsAction extends Action {

    constructor() {
        super();
    }

    getRequestData() {
        return {
        }
    }

    submit(callback: (data: BasicProjectData[]) => void): void {
        // This request never gets sent to the server - list of remote projects is stored locally.
        window.project.getRemoteProjects()
            .then((projects: BasicProjectData[]) => {
                callback(projects);
            });
    }

    processResponse(): void {
        // no-op - it's handled in submit's "callback" parameter
    }

}
