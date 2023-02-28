
import path from 'path';
import fs from 'fs';

import { UserFile } from '../../common/DataTypes/FileDataTypes';

function saveConfig(filePath: string, newConfig: UserFile) {
    fs.writeFileSync(filePath, JSON.stringify(newConfig));
}

function loadConfigFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
        // TODO-const : error handling
        throw new Error("User config file was not properly initialized on startup.");
    }

    let userConfig: UserFile = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return userConfig;
}

export function consumeRegistrationKey(userFile: string, key: string, clientId: string, clientName: string, token: string) {
    let data = loadConfigFile(userFile);
    let keyIndex = data.registrationKeys.indexOf(key);
    if (keyIndex === -1) {
        throw new Error("Registration key not found.");
    }

    data.registrationKeys.splice(keyIndex, 1);
    data.authorizedUsers.push({ clientId, clientName, token });

    saveConfig(userFile, data);
}