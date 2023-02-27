
import fs from 'fs';

import { v4 as uuidv4 } from 'uuid';
import { UserFile } from '../../common/DataTypes/FileDataTypes';

const LIST_COMMAND     = "   node ./user-management.js ./users.json list";
const REVOKE_COMMAND   = "   node ./user-management.js ./users.json revoke <user-id>";
const GENERATE_COMMAND = "   node ./user-management.js ./users.json generate";
const DELETE_COMMAND   = "   node ./user-management.js ./users.json delete <key>";
const PURGE_COMMAND    = "   node ./user-management.js ./users.json purge";

function printUsage() {
    console.log("==================================================");
    console.log("");
    console.log(" General usage");
    console.log("   node <this-script> <user-file> <action> [<property>]");
    console.log("");
    console.log("--------------------------------------------------");
    console.log("");
    console.log(" List users");
    console.log(LIST_COMMAND);
    console.log("");
    console.log(" Revoke an existing user's access");
    console.log(REVOKE_COMMAND);
    console.log("");
    console.log(" Generate a new user registration key");
    console.log(GENERATE_COMMAND);
    console.log("");
    console.log(" Delete a pending new user key");
    console.log(DELETE_COMMAND);
    console.log("");
    console.log(" Delete ALL pending new user keys");
    console.log(PURGE_COMMAND);
    console.log("");
    console.log("==================================================");
}

if (process.argv.length < 4) {
    printUsage();
    process.exit(0);
}

const userFile = process.argv[2];
const action   = process.argv[3];

if      (action === "list")     listUsers();
else if (action === "revoke")   revokeUser(process.argv[4]);
else if (action === "generate") generateKey();
else if (action === "delete")   deleteKey(process.argv[4]);
else if (action === "purge")    purgeAllKeys();
else                            printUsage();

function listUsers() {
    let contents = readUsersFile();
    console.log("");
    console.log(JSON.stringify(contents, null, 2));
    console.log("");
}

function revokeUser(userId: string | undefined) {
    if (!userId) {
        console.log("");
        console.error("You must provide a userId to revoke.");
        console.error(LIST_COMMAND);
        console.error(REVOKE_COMMAND);
        console.log("");
    } else {
        let contents = readUsersFile();
        let index = contents.authorizedUsers.findIndex(user => user.userId === userId);
        if (index === -1) {
            console.log("");
            console.log("User not found.");
            console.log("");
            process.exit(1);
        }
        contents.authorizedUsers.splice(index, 1);
        writeUsersFile(contents);
    }
}

function generateKey() {
    let contents = readUsersFile();
    let key = uuidv4();
    contents.registrationKeys.push(key);
    console.log("");
    console.log("Provide this key to a single user for them to register an account:");
    console.log("");
    console.log(`  ${key}`);
    console.log("");
    writeUsersFile(contents);
}

function deleteKey(key: string | undefined) {
    if (!key) {
        console.log("");
        console.error("You must provide a key to delete.");
        console.error(LIST_COMMAND);
        console.error(DELETE_COMMAND);
        console.log("");
    } else {
        let contents = readUsersFile();
        let index = contents.registrationKeys.indexOf(key);
        if (index === -1) {
            console.log("");
            console.log("Key not found.");
            console.log("");
            process.exit(1);
        }
        contents.registrationKeys.splice(index, 1);
        writeUsersFile(contents);
        console.log("");
        console.log(`Removed key: ${key}`);
        console.log("");
    }
}

function purgeAllKeys() {
    let contents = readUsersFile();
    contents.registrationKeys = [];
    writeUsersFile(contents);
    console.log("");
    console.log("Removed all pending registration keys.");
    console.log("");
}

function readUsersFile() {
    if (!fs.existsSync(userFile)){
        console.log("");
        console.error("Failed to find the user file at " + userFile);
        console.log("");
        process.exit(1);
    }

    try {
        return JSON.parse(fs.readFileSync(userFile, 'utf-8')) as UserFile;
    } catch(err) {
        console.log("");
        console.error("Failed to parse user file.");
        console.log("");
        console.error(err);
        console.log("");
        process.exit(1);
    }
}

function writeUsersFile(newFileContents: UserFile) {
    fs.writeFileSync(userFile, JSON.stringify(newFileContents));
}