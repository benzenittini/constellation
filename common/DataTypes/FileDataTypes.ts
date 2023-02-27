
export type UserFile = {
    registrationKeys: string[];
    authorizedUsers: { userId: string, token: string }[];
};

export type ConfigFile = {
    localBoards: string[];
    remoteProjects: RemoteProject[];
};

export type RemoteProject = {
    serverUrl: string; // Includes port.
    credentials: string;
}