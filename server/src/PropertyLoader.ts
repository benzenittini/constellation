
import fs from 'fs';

import { UserFile } from '../../common/DataTypes/FileDataTypes';

// Keep these in sync!
const VALID_PROPS: (keyof Properties)[] = [ 'log_level', 'log_dir', 'board_dir', 'backup_dir', 'user_auth', 'server_host', 'server_port', 'token_private_key' ];
type Properties = {
    log_level: string,
    log_dir: string,
    board_dir: string,
    backup_dir: string,
    user_auth: string,
    server_host: string,
    server_port: string,
    token_private_key: string,
};

export const properties: Properties = {
    log_level:   '',
    log_dir:     '',
    board_dir:   '',
    backup_dir:  '',
    user_auth:   '',
    server_host: '',
    server_port: '',
    token_private_key: '',
};

export function populateProperties(configFile: string) {
    try {
        // Parse the file
        let keyValues = fs.readFileSync(configFile, 'utf-8')
            .split('\n')
            // Remove comments
            .filter(line => !line.startsWith('#'))
            // Remove inline comments
            .map(line => {
                let commentIndex = line.indexOf('#');
                return commentIndex === -1
                    ? line : line.substring(0, commentIndex);
            })
            // Split into key/values
            .map(line => line.split("="))
            // Remove incomplete key/values
            .filter(kv => kv.length === 2)
            // Parse into useful objects
            .map(kv => ({
                key: (kv[0].trim() as keyof Properties),
                value: kv[1].trim()
            }))
            // Remove invalid keys
            .filter(kv => VALID_PROPS.includes(kv.key));

        // Save into our properties object
        for (let {key, value} of keyValues) {
            properties[key] = value;
        }

        // Validate our properties
        for (let prop of VALID_PROPS) {
            if (properties[prop as keyof Properties].trim() === '') {
                console.error(`Required property was not properly set: ${prop}`);
                throw new Error();
            }
        }

        // Create any directories/files that don't exist.
        createDirIfNeeded(properties.log_dir);
        createDirIfNeeded(properties.board_dir);
        createDirIfNeeded(properties.backup_dir);
        if (!fs.existsSync(properties.user_auth)) {
            const contents: UserFile = {
                registrationKeys: [],
                authorizedUsers: [],
            }
            fs.writeFileSync(properties.user_auth, JSON.stringify(contents));
        }
    } catch (err) {
        console.error(err);
        console.error("Failed to read/parse provided properties file.");
        process.exit(1);
    }
}

function createDirIfNeeded(dir: string) {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
}