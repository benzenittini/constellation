
import { Action } from "../Action";

import { send } from '../../communications/RestComms';

import { GENERIC_RESTART, JoinProjectResponse, RemoteProject } from 'constellation-common/datatypes';
import { StringUtils } from 'constellation-common/utilities';
import { GetProjectDataAction } from "./GetProjectData";
import { E12, showError } from "../../ErrorLogger";
import { useStore } from "../../store/store";
import { useVueNotify } from "mw-vue-notify";

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
        // Fail to join if user is already a member
        if (StringUtils.anyAreBlank([this.projectUrl, this.registrationKey, this.clientName])) {
            useVueNotify().showNotification({
                cssClasses: ['mw-notification', 'warning'],
                dismissAfterMillis: 4000,
                data: { message: `Please provide values for all fields.` },
            });
            return;
        } else if (useStore().state.generalData.remoteProjectLookup.some(p => p.remoteProject.serverUrl === this.projectUrl)) {
            useVueNotify().showNotification({
                cssClasses: ['mw-notification', 'warning'],
                dismissAfterMillis: 4000,
                data: { message: `You are already a member of this project. First remove the project if you want to re-join.` },
            });
            return;
        }

        // This is a "remote server only" action
        send<JoinProjectResponse>({
            httpMethod: 'post',
            baseUrl: this.projectUrl,
            endpoint: '/user',
            data: {
                registrationKey: this.registrationKey,
                clientName: this.clientName,
            },
            callback: (resp) => this.processResponse(resp.data),
            errorHandler: (error) => {
                this.processResponse({
                    errorCode: 3,
                    message: "Could not connect to the server. Please verify your Server URL is correct.",
                });
            }
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
