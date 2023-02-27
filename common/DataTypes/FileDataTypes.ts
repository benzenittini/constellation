
export type UserFile = {
    registrationKeys: string[];
    authorizedUsers: { userId: string, token: string }[];
};