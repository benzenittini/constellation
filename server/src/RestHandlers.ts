
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import path from 'path';

import { logger } from "./Logger";
import { properties } from "./PropertyLoader";
import * as UserDataPersistence from './UserDataPersistence';
import { ProjectDataPersistence } from './ProjectDataPersistence';
import { BoardDataPersistence } from '../../common/persistence/BoardDataPersistence';
import { TypedMap } from "../../common/DataTypes/GenericDataTypes";
import * as T from "../../common/DataTypes/ActionDataTypes";

let projectDataPersistence: ProjectDataPersistence | undefined = undefined;
let boardDataPersistence: TypedMap<BoardDataPersistence> = {};
export function initializePersistence(filepath: string) {
    projectDataPersistence = new ProjectDataPersistence(filepath);
}


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

export async function deleteUser(req: Request, res: Response) {
    try {
        let jwt = getJwt(req);

        UserDataPersistence.removeUserFromProject(jwt);

        // Return the projectId to the client
        res.json({});
    } catch(err) {
        logger.error(err);
        res.status(500).json({});
    }
}

export async function getProject(req: Request, res: Response) {
    try {
        requireAuthorization(req, res, async () => {
            res.json(await projectDataPersistence!.getBasicProjectData());
        });
    } catch(err) {
        logger.error(err);
        res.status(500).json({});
    }
}

export async function postBoard(req: Request, res: Response) {
    try {
        requireAuthorization(req, res, async () => {
            let data: T.CreateNewBoardRequest = req.body;

            // Create the board in our project persistence
            let result = await projectDataPersistence!.createNewBoard(data);
            if (!result) throw new Error('Board creation failed.');

            // Create the board in our board persistence
            boardDataPersistence[result.boardId] = new BoardDataPersistence(
                path.resolve(properties.board_dir, result.boardId + ".mw"),
                BoardDataPersistence.getInitData(data.template));
            res.json(result);
        });
    } catch(err) {
        logger.error(err);
        res.status(500).json({});
    }
}