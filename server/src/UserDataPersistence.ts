
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { AuthorizedUser, UserFile, ConstError } from 'constellation-common/datatypes';

import { logger } from './Logger';
import { properties } from './PropertyLoader';

let lastLoadedData: UserFile | undefined = undefined;

function saveConfig() {
    fs.writeFileSync(properties.user_data, JSON.stringify(lastLoadedData));
}

function watchConfigFile() {
    fs.watch(properties.user_data, {
        persistent: false,
    }, (eventType, filename) => {
        if (eventType === 'change') {
            loadConfigFile();
        }
    });
}

function loadConfigFile() {
    if (!fs.existsSync(properties.user_data)) {
        throw new ConstError(3,
            "User config file was not properly initialized on startup.",
            ConstError.getLineId('UserDataPersistence', 'loadConfigFile', 1),
            `User config file was not found at ${properties.user_data}. This is configured via the 'user_data' property.`);
    }

    if (!lastLoadedData) {
        watchConfigFile();
    }

    let userConfig: UserFile = JSON.parse(fs.readFileSync(properties.user_data, 'utf-8'));
    lastLoadedData = userConfig;
    return userConfig;
}

export function consumeRegistrationKey(key: string, clientName: string, token: string) {
    if (!lastLoadedData) loadConfigFile();

    let keyIndex = lastLoadedData!.registrationKeys.indexOf(key);
    if (keyIndex === -1) {
        throw new ConstError(3,
            "Invalid registration key.",
            ConstError.getLineId('UserDataPersistence', 'consumeRegistrationKey', 1),
            "Provided registration key was not found.");
    }

    lastLoadedData!.registrationKeys.splice(keyIndex, 1);
    lastLoadedData!.authorizedUsers.push({ clientId: uuidv4(), clientName, token, registrationDate: new Date().toISOString() });

    saveConfig();
}

export function verifyCreds(token: string | undefined): AuthorizedUser | undefined {
    if (!token) return undefined;
    if (!lastLoadedData) loadConfigFile();

    let user = lastLoadedData!.authorizedUsers.find(user => user.token === token);

    if (!user) {
        logger.error("Provided auth token doesn't match any registered users.");
        return undefined;
    }

    return user;
}

export function removeUserFromProject(token: string | undefined): void {
    if (!lastLoadedData) loadConfigFile();

    let index = lastLoadedData!.authorizedUsers.findIndex(user => user.token === token);
    if (index !== -1) {
        lastLoadedData!.authorizedUsers.splice(index, 1);
        saveConfig();
    }
}