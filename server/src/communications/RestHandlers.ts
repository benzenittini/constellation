
import { Request, Response } from "express";
import jwt from 'jsonwebtoken';

import { logger } from "../utilities/Logger";
import { properties } from "../utilities/PropertyLoader";
import * as UserDataPersistence from '../persistence/UserDataPersistence';
import { ConstError, CreateNewBoardRequest, DownloadBoardDataResponse, ErrorResponse, GetProjectDataResponse, ImportBoardRequest } from 'constellation-common/datatypes';

import { projectDataPersistence, boardDataPersistence, deleteBoardPersistence, addBoardPersistence, importBoardPersistence } from "../persistence/Persistence";


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
        const err: ErrorResponse = { errorCode: 1, message: "You are not authorized to perform this action." };
        res.json(err);
    }
}


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
        if (ConstError.isConstError(err)) {
            logger.error(err.message);
            res.json(err.getErrorResponse());
        } else {
            logger.error(err);
            const response: ErrorResponse = { errorCode: 2, message: undefined };
            res.json(response);
        }
    }
}

export async function deleteUser(req: Request, res: Response) {
    try {
        let jwt = getJwt(req);

        UserDataPersistence.removeUserFromProject(jwt);

        res.json({});
    } catch(err) {
        logger.error(err);
        // We pretend everything is ok to the user for this request. User is leaving, so they
        // don't need to know that the server is on fire.
        res.json({});
    }
}


// =================
// Project Endpoints
// -----------------

export async function getProject(req: Request, res: Response) {
    try {
        requireAuthorization(req, res, async () => {
            const response: GetProjectDataResponse = {
                ...(await projectDataPersistence!.getBasicProjectData()),
                version: WEBPACK.APP_VERSION,
                capabilities: {
                    downloadBoard: true,
                    bulkCreateBlocks: true,
                },
            }
            res.json(response);
        });
    } catch(err) {
        logger.error(err);
        const response: ErrorResponse = { errorCode: 2, message: undefined };
        res.json(response);
    }
}

export async function getProjectTemplates(req: Request, res: Response) {
    try {
        requireAuthorization(req, res, async () => {
            res.json(await projectDataPersistence!.getTemplates());
        });
    } catch(err) {
        logger.error(err);
        const response: ErrorResponse = { errorCode: 2, message: undefined };
        res.json(response);
    }
}


// ===============
// Board Endpoints
// ---------------

export async function postBoard(req: Request, res: Response) {
    try {
        requireAuthorization(req, res, async () => {
            let data: CreateNewBoardRequest = req.body;

            // Create the board in our project persistence
            let result = await projectDataPersistence!.createNewBoard(data);
            if ('errorCode' in result) {
                logger.error(`Board creation failed: ${result.message}`);
                res.json(result);
                return;
            }

            // Create the board in our board persistence
            addBoardPersistence(result.boardId, data.template);

            // Save the initial template
            projectDataPersistence!.addOrUpdateTemplate(result.boardId, data.template);

            res.json(result);
        });
    } catch(err) {
        logger.error(err);
        const response: ErrorResponse = { errorCode: 2, message: undefined };
        res.json(response);
    }
}

export async function putBoard(req: Request, res: Response) {
    try {
        requireAuthorization(req, res, async () => {
            let { boardName, initialData } = (req.body as ImportBoardRequest)!;

            // Create the board in our project persistence
            let result = await projectDataPersistence!.createNewBoard({ boardOrFileName: boardName, template: [] });
            if ('errorCode' in result) {
                logger.error(`Board creation failed: ${result.message}`);
                res.json(result);
                return;
            }

            // Create the board in our board persistence
            importBoardPersistence(result.boardId, initialData);

            // Save the initial template
            let template = boardDataPersistence[result.boardId].getBoardTemplate();
            projectDataPersistence!.addOrUpdateTemplate(result.boardId, template);

            res.json(result);
        });
    } catch(err) {
        logger.error(err);
        const response: ErrorResponse = { errorCode: 2, message: undefined };
        res.json(response);
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
        const response: ErrorResponse = { errorCode: 2, message: undefined };
        res.json(response);
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
        const response: ErrorResponse = { errorCode: 2, message: undefined };
        res.json(response);
    }
}

export async function getBoardById(req: Request, res: Response) {
    try {
        requireAuthorization(req, res, async () => {
            const boardId = req?.params?.id;
            const boardName = (await projectDataPersistence!.getBasicProjectData()).boards[boardId].boardName;
            const boardData = await boardDataPersistence[boardId].getBoardData();
            const response: DownloadBoardDataResponse = { boardData, boardName };
            res.json(response);
        });
    } catch(err) {
        logger.error(err);
        const response: ErrorResponse = { errorCode: 2, message: undefined };
        res.json(response);
    }
}