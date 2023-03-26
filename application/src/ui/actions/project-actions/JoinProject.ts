
import { Action } from "../Action";

import { send } from '../../communications/RestComms';

import { GENERIC_RESTART, JoinProjectResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { GetProjectDataAction } from "./GetProjectData";
import { RemoteProject } from "../../../../../common/DataTypes/FileDataTypes";
import { E12, showError } from "../../../common/ErrorLogger";

export class JoinProjectAction extends Action {

    private projectUrl: string;
    private registrationKey: string;
    private clientName: string;

    constructor(projectUrl: string, registrationKey: string, clientName: string) {
        super();

        this.projectUrl = projectUrl;
        this.registrationKey = registrationKey;
        this.clientName = clientName;
    }

    submit(): void {
        // This is a "remote server only" action
        send<JoinProjectResponse>({
            httpMethod: 'post',
            baseUrl: this.projectUrl,
            endpoint: '/user',
            data: {
                registrationKey: this.registrationKey,
                clientName: this.clientName,
            },
            callback: (resp) => this.processResponse(resp.data)
        });
    }

    processResponse(resp: JoinProjectResponse): void {
        if ('errorCode' in resp) {
            this.errorCallback(resp);

        } else {
            const project: RemoteProject = {
                serverUrl: this.projectUrl,
                credentials: resp.token,
            };

            // Persist the serverUrl and credentials to our local config file.
            window.config.addRemoteProject(project)
                .then(resp => {
                    if ('errorCode' in resp) {
                        this.errorCallback(resp);

                    }
                });

            // Fetch the project data
            new GetProjectDataAction(project)
                .onError(error => {
                    showError(E12, [error.message || GENERIC_RESTART]);
                }).submit();

            if (this.successCallback)
                this.successCallback(resp);
        }
    }

}
