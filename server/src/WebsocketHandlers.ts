
import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import { boardDataPersistence } from './Persistence';
import { logger } from './Logger';

export function getBoardData(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId } = JSON.parse(message);
            let result = await boardDataPersistence[boardId].getBoardData();
            socket.emit('getBoardData', result);
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
        try {
            let { boardId, location, parentBlockId } = JSON.parse(message);
            let result = await boardDataPersistence[boardId].createBlock(uuidv4(), location, parentBlockId);
            io.in(boardId).emit('createBlock', result);
        } catch(err) {
            // TODO-const : error handling
            logger.error(`Error encountered when creating a block: ${err}`);
            // TODO-const : socket.emit('createBlock', error?);
        }
    };
}

export function setBlockPositions(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId, blocksAndPositions } = JSON.parse(message);
            let result = await boardDataPersistence[boardId].setBlockPositions(blocksAndPositions);
            socket.broadcast.in(boardId).emit('setBlockPositions', result);
        } catch(err) {
            // TODO-const : error handling
            logger.error(`Error encountered when setting block positions: ${err}`);
            // TODO-const : socket.emit('setBlockPositions', error?);
        }
    };
}

export function deleteBlocks(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId, blockIds } = JSON.parse(message);
            let result = await boardDataPersistence[boardId].deleteBlocks(blockIds);
            io.in(boardId).emit('deleteBlocks', { blockIds: result });
        } catch(err) {
            // TODO-const : error handling
            logger.error(`Error encountered when deleting blocks: ${err}`);
            // TODO-const : socket.emit('deleteBlocks', error?);
        }
    };
}

export function setBlockParent(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId, blockId, parentBlockId } = JSON.parse(message);
             await boardDataPersistence[boardId].setBlockParent(blockId, parentBlockId);
            io.in(boardId).emit('setBlockParent', { blockId, parentBlockId });
        } catch(err) {
            // TODO-const : error handling
            logger.error(`Error encountered when setting a block's parent: ${err}`);
            // TODO-const : socket.emit('setBlockParent', error?);
        }
    };
}

export function setBlockContent(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId, blockId, content } = JSON.parse(message);
            await boardDataPersistence[boardId].setBlockContent(blockId, content);
            io.in(boardId).emit('setBlockContent', { blockId, content });
        } catch(err) {
            // TODO-const : error handling
            logger.error(`Error encountered when setting a block's content: ${err}`);
            // TODO-const : socket.emit('setBlockContent', error?);
        }
    };
}


// ==========================
// Fields and Classifications
// --------------------------

export function setClassificationDefinitions(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId, ...req } = JSON.parse(message);
            let result = await boardDataPersistence[boardId].setClassificationDefinitions(req);
            io.in(boardId).emit('setClassificationDefinitions', result);
        } catch(err) {
            // TODO-const : error handling
            logger.error(`Error encountered when setting the classification definitions: ${err}`);
            // TODO-const : socket.emit('setClassificationDefinitions', error?);
        }
    };
}

export function setClassificationOnBlocks(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId, ...req } = JSON.parse(message);
            let result = await boardDataPersistence[boardId].setClassificationOnBlocks(req);
            io.in(boardId).emit('setClassificationOnBlocks', result);
        } catch(err) {
            // TODO-const : error handling
            logger.error(`Error encountered when setting a classification on blocks: ${err}`);
            // TODO-const : socket.emit('setClassificationOnBlocks', error?);
        }
    };
}

export function setFieldDefinitions(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId, ...req } = JSON.parse(message);
            let result = await boardDataPersistence[boardId].setFieldDefinitions(req);
            io.in(boardId).emit('setFieldDefinitions', result);
        } catch(err) {
            // TODO-const : error handling
            logger.error(`Error encountered when setting field definitions on a block: ${err}`);
            // TODO-const : socket.emit('setFieldDefinitions', error?);
        }
    };
}

export function setFieldOnBlocks(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId, ...req } = JSON.parse(message);
            let result = await boardDataPersistence[boardId].setFieldOnBlocks(req);
            io.in(boardId).emit('setFieldOnBlocks', result);
        } catch(err) {
            // TODO-const : error handling
            logger.error(`Error encountered when setting a field value on a block: ${err}`);
            // TODO-const : socket.emit('setFieldOnBlocks', error?);
        }
    };
}


// =====
// Views
// -----

export function saveView(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId, ...req } = JSON.parse(message);
            let result = await boardDataPersistence[boardId].saveView(req);
            io.in(boardId).emit('saveView', result);
        } catch(err) {
            // TODO-const : error handling
            logger.error(`Error encountered when saving a view: ${err}`);
            // TODO-const : socket.emit('saveView', error?);
        }
    };
}

export function deleteView(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId, ...req } = JSON.parse(message);
            let result = await boardDataPersistence[boardId].deleteView(req);
            io.in(boardId).emit('deleteView', result);
        } catch(err) {
            // TODO-const : error handling
            logger.error(`Error encountered when deleting a view: ${err}`);
            // TODO-const : socket.emit('deleteView', error?);
        }
    };
}

export function setBlockPriority(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId, ...req } = JSON.parse(message);
            let result = await boardDataPersistence[boardId].setBlockPriority(req);
            io.in(boardId).emit('setBlockPriority', result);
        } catch(err) {
            // TODO-const : error handling
            logger.error(`Error encountered when setting a block's priority: ${err}`);
            // TODO-const : socket.emit('setBlockPriority', error?);
        }
    };
}

export function loadView(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId, ...req } = JSON.parse(message);
            let result = await boardDataPersistence[boardId].loadView(req);
            io.in(boardId).emit('loadView', result);
        } catch(err) {
            // TODO-const : error handling
            logger.error(`Error encountered when loading a view: ${err}`);
            // TODO-const : socket.emit('loadView', error?);
        }
    };
}
