
import fs from 'fs';

// Keep these in sync!
const VALID_PROPS: (keyof Properties)[] = [ 'log_dir', 'board_dir', 'backup_dir', 'user_auth', 'server_host', 'server_port' ];
type Properties = {
    log_dir: string,
    board_dir: string,
    backup_dir: string,
    user_auth: string,
    server_host: string,
    server_port: string,
};

export const properties: Properties = {
    log_dir:     '',
    board_dir:   '',
    backup_dir:  '',
    user_auth:   '',
    server_host: '',
    server_port: '',
};

export function populateProperties(configFile: string) {
    try {
        // Parse the file
        let keyValues = fs.readFileSync(configFile, 'utf-8')
            .split('\n')
            .map(line => line.trim())
            .filter(line => !line.startsWith('#')) // Remove comments
            .map(line => line.split("="))          // Split into key/values
            .filter(kv => kv.length === 2)         // Remove incomplete key/values
            .map(kv => ({                          // Parse into useful objects
                key: (kv[0].trim() as keyof Properties),
                value: kv[1].trim()
            }))
            .filter(kv => VALID_PROPS.includes(kv.key)); // Remove invalid keys

        // Save into our properties object
        for (let {key, value} of keyValues) {
            properties[key] = value;
        }

        // Validate our properties
        for (let prop of VALID_PROPS) {
            if (properties[prop as keyof Properties].trim() === '') {
                // TODO-const : logger
                console.log(`Required property was not properly set: ${prop}`);
                throw new Error();
            }
        }
    } catch (err) {
        // TODO-const : logger
        console.log("Failed to read/parse provided properties file.");
        process.exit(1);
    }
}