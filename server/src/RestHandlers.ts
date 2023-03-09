
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';

import { logger } from "./Logger";
import { properties } from "./PropertyLoader";
import * as UserDataPersistence from './UserDataPersistence';
import * as T from "../../common/DataTypes/ActionDataTypes";

import { projectDataPersistence, boardDataPersistence, deleteBoardPersistence, addBoardPersistence, importBoardPersistence } from "./Persistence";


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

// TODO-const : Move all the "try/catch" blocks in these handlers into a single helper function..?

// ==============
// User Endpoints
// --------------

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


// =================
// Project Endpoints
// -----------------

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

export async function getProjectTemplates(req: Request, res: Response) {
    try {
        requireAuthorization(req, res, async () => {
            res.json(await projectDataPersistence!.getTemplates());
        });
    } catch(err) {
        logger.error(err);
        res.status(500).json({});
    }
}


// ===============
// Board Endpoints
// ---------------

export async function postBoard(req: Request, res: Response) {
    try {
        requireAuthorization(req, res, async () => {
            let data: T.CreateNewBoardRequest = req.body;

            // Create the board in our project persistence
            let result = await projectDataPersistence!.createNewBoard(data);
            if (!result) throw new Error('Board creation failed.');

            // Create the board in our board persistence
            addBoardPersistence(result.boardId, data.template);

            // Save the initial template
            projectDataPersistence!.addOrUpdateTemplate(result.boardId, data.template);

            res.json(result);
        });
    } catch(err) {
        logger.error(err);
        res.status(500).json({});
    }
}

export async function putBoard(req: Request, res: Response) {
    try {
        requireAuthorization(req, res, async () => {
            let { boardName, initialData } = (req.body as T.ImportBoardRequest)!;

            // Create the board in our project persistence
            let result = await projectDataPersistence!.createNewBoard({ boardOrFileName: boardName, template: [] });
            if (!result) throw new Error('Board creation failed.');

            // Create the board in our board persistence
            importBoardPersistence(result.boardId, initialData);

            // Save the initial template
            let template = boardDataPersistence[result.boardId].getBoardTemplate();
            projectDataPersistence!.addOrUpdateTemplate(result.boardId, template);

            res.json(result);
        });
    } catch(err) {
        logger.error(err);
        res.status(500).json({});
    }
}

export async function deleteBoard(req: Request, res: Response) {
    try {
        requireAuthorization(req, res, async () => {
            let boardId = req?.params?.id;
            deleteBoardPersistence(boardId);
            let response = await projectDataPersistence!.deleteBoard({boardId});
            projectDataPersistence!.removeTemplate(boardId);
            res.json(response);
        });
    } catch(err) {
        logger.error(err);
        res.status(500).json({});
    }
}

export async function putBoardById(req: Request, res: Response) {
    try {
        requireAuthorization(req, res, async () => {
            let boardId = req?.params?.id;
            res.json(await projectDataPersistence!.updateBoardConfig(boardId, req.body));
        });
    } catch(err) {
        logger.error(err);
        res.status(500).json({});
    }
}