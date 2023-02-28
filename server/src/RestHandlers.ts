
import { Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

import { logger } from "./Logger";
import { properties } from "./PropertyLoader";
import * as UserDataPersistence from '../../common/persistence/UserDataPersistence';

export async function postUser(req: Request, res: Response) {
    try {
        let registrationKey = req?.body?.registrationKey;
        let clientName      = req?.body?.clientName;
        let clientAuthToken = jwt.sign({ registrationKey }, properties.token_private_key);
        let clientId        = uuidv4();
        UserDataPersistence.consumeRegistrationKey(properties.user_auth, registrationKey, clientId, clientName, clientAuthToken);

        // Return the token to the client
        res.json({ token: clientAuthToken });
    } catch(err) {
        logger.error(err);
        res.status(500).json({});
    }
}