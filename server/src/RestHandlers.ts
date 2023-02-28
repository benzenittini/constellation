
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';

import { logger } from "./Logger";
import { properties } from "./PropertyLoader";
import * as UserDataPersistence from './UserDataPersistence';
import { ProjectDataPersistence } from './ProjectDataPersistence';

const projectDataPersistence = new ProjectDataPersistence(properties.project_data);

function getJwt(req: Request) {
    let header = req.header('Authorization')?.split(' ');
    if (header && header.length === 2) {
        return header[1].trim();
    }
    return undefined;
}

function requireAuthorization(req: Request, res: Response, callback: () => void) {
    let creds = getJwt(req);
    if (UserDataPersistence.verifyCreds(creds)) {
        callback();
    } else {
        res.status(401).json({});
    }
}

export async function postUser(req: Request, res: Response) {
    try {
        let registrationKey = req?.body?.registrationKey;
        let clientName      = req?.body?.clientName;
        let clientAuthToken = jwt.sign({ registrationKey }, properties.token_private_key);
        UserDataPersistence.consumeRegistrationKey(registrationKey, clientName, clientAuthToken);

        // Return the token to the client
        res.json({ token: clientAuthToken });
    } catch(err) {
        logger.error(err);
        res.status(500).json({});
    }
}

export async function getProject(req: Request, res: Response) {
    try {
        requireAuthorization(req, res, async () => {
            res.json(await projectDataPersistence.getBasicProjectData());
        });
    } catch(err) {
        logger.error(err);
        res.status(500).json({});
    }
}