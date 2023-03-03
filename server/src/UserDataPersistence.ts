
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { UserFile } from '../../common/DataTypes/FileDataTypes';
import { logger } from './Logger';
import { properties } from './PropertyLoader';

let lastLoadedData: UserFile | undefined = undefined;

function saveConfig() {
    fs.writeFileSync(properties.user_data, JSON.stringify(lastLoadedData));
}

function loadConfigFile() {
    if (!fs.existsSync(properties.user_data)) {
        // TODO-const : error handling
        throw new Error("User config file was not properly initialized on startup.");
    }

    let userConfig: UserFile = JSON.parse(fs.readFileSync(properties.user_data, 'utf-8'));
    lastLoadedData = userConfig;
    return userConfig;
}

export function consumeRegistrationKey(key: string, clientName: string, token: string) {
    if (!lastLoadedData) loadConfigFile();

    let keyIndex = lastLoadedData!.registrationKeys.indexOf(key);
    if (keyIndex === -1) {
        throw new Error("Registration key not found.");
    }

    lastLoadedData!.registrationKeys.splice(keyIndex, 1);
    lastLoadedData!.authorizedUsers.push({ clientId: uuidv4(), clientName, token, registrationDate: new Date().toISOString() });

    saveConfig();
}

export function verifyCreds(token: string | undefined): boolean {
    if (!token) return false;
    if (!lastLoadedData) loadConfigFile();

    let user = lastLoadedData!.authorizedUsers.find(user => user.token === token);

    if (!user) {
        logger.error("Provided auth token doesn't match any registered users.");
        return false;
    }

    return true;
}

export function removeUserFromProject(token: string | undefined): void {
    if (!lastLoadedData) loadConfigFile();

    let index = lastLoadedData!.authorizedUsers.findIndex(user => user.token === token);
    if (index !== -1) {
        lastLoadedData!.authorizedUsers.splice(index, 1);
        saveConfig();
    }
}