
import { GENERIC_RESTART, GetRemoteProjectsResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { E2, showError } from "../../../common/ErrorLogger";
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
        if ('errorCode' in resp) {
            this.errorCallback(resp);

        } else {
            const store = useStore();
            resp.forEach(remote => {
                store.dispatch('registerRemoteProject', {remoteProject: remote});
                new GetProjectDataAction(remote)
                    .onError(error => {
                        if (typeof error.message === 'string') {
                            showError(E2, [error.message || GENERIC_RESTART]);
                        } else {
                            // Swallowing axios errors since the project is already highlighted in red.
                        }
                    }).submit();
            });

            if (this.successCallback)
                this.successCallback(resp);
        }
    }

}
