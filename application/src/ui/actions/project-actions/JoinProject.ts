
import { Action } from "../Action";

import { send } from '../../communications/RestComms';

import { JoinProjectResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { GetProjectDataAction } from "./GetProjectData";
import { RemoteProject } from "../../../../../common/DataTypes/FileDataTypes";

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
            endpoint: `${this.projectUrl}/user`,
            data: {
                registrationKey: this.registrationKey,
                clientName: this.clientName,
            },
            callback: (resp) => this.processResponse(resp.data)
        });
    }

    processResponse(resp: JoinProjectResponse): void {
        const project: RemoteProject = {
            serverUrl: this.projectUrl,
            credentials: resp.token,
        };

        // Persist the serverUrl and credentials to our local config file.
        window.config.addRemoteProject(project);

        // Fetch the project data
        new GetProjectDataAction(project).submit();
    }

}
