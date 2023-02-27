
export type UserFile = {
    registrationKeys: string[];
    authorizedUsers: { userId: string, token: string }[];
};

export type ConfigFile = {
    localBoards: string[];
    remoteProjects: any[]; // TODO-const : properly set the server config data type
};