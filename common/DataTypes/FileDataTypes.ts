import { TemplateClassification } from "./BoardDataTypes";
import { TypedMap } from "./GenericDataTypes";

export type AuthorizedUser = {
    clientId: string;
    clientName: string;
    token: string;
    registrationDate: string;
};
export type UserFile = {
    registrationKeys: string[];
    authorizedUsers: AuthorizedUser[];
};

export type ConfigFile = {
    localBoards: string[];
    remoteProjects: RemoteProject[];
    // Keyed by boardId (ie, filepath)
    boardTemplates: TypedMap<TemplateClassification[]>
    // Keyed by boardId (ie, filepath)
    backups: TypedMap<{
        file: string,
        dateSaved: Date,
    }[]>;
    userSettings: UserSettings;
};

export type UserSettings = {
    panSpeed: number;
    zoomSpeed: number;
};

export type RemoteProject = {
    serverUrl: string; // Includes port.
    credentials: string;
};