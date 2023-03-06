
import { Socket, Server } from 'socket.io';

import { boardDataPersistence } from './Persistence';
import { logger } from './Logger';

export function getBoardData(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId } = JSON.parse(message);
            let result = await boardDataPersistence[boardId].getBoardData();
            socket.emit('boardData', result);
        } catch(err) {
            // TODO-const : error handling
            logger.error(`Error encountered when getting board data: ${err}`);
            // TODO-const : socket.emit('boardData', error?);
        }
    }
}


// ======
// Blocks
// ------

export function createBlock(io: Server, socket: Socket) {
    return async (message: string) => {
    };
}

export function setBlockPositions(io: Server, socket: Socket) {
    return async (message: string) => {
    };
}

export function deleteBlocks(io: Server, socket: Socket) {
    return async (message: string) => {
    };
}

export function setBlockParent(io: Server, socket: Socket) {
    return async (message: string) => {
    };
}

export function setBlockContent(io: Server, socket: Socket) {
    return async (message: string) => {
    };
}


// ==========================
// Fields and Classifications
// --------------------------

export function setClassificationDefinitions(io: Server, socket: Socket) {
    return async (message: string) => {
    };
}

export function setClassificationOnBlocks(io: Server, socket: Socket) {
    return async (message: string) => {
    };
}

export function setFieldDefinitions(io: Server, socket: Socket) {
    return async (message: string) => {
    };
}

export function setFieldOnBlocks(io: Server, socket: Socket) {
    return async (message: string) => {
    };
}


// =====
// Views
// -----

export function saveView(io: Server, socket: Socket) {
    return async (message: string) => {
    };
}

export function deleteView(io: Server, socket: Socket) {
    return async (message: string) => {
    };
}

export function setBlockPriority(io: Server, socket: Socket) {
    return async (message: string) => {
    };
}

export function loadView(io: Server, socket: Socket) {
    return async (message: string) => {
    };
}
