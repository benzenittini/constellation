
export type UserFile = {
    registrationKeys: string[];
    authorizedUsers: { clientId: string, clientName: string, token: string, registrationDate: string }[];
};

export type ConfigFile = {
    localBoards: string[];
    remoteProjects: RemoteProject[];
};

export type RemoteProject = {
    serverUrl: string; // Includes port.
    credentials: string;
}