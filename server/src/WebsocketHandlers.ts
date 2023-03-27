
import { Socket, Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

import { boardDataPersistence, projectDataPersistence } from './Persistence';
import { logger } from './Logger';
import { ConstError, ErrorResponse } from '../../common/DataTypes/ActionDataTypes';

export function getBoardData(io: Server, socket: Socket) {
    return async (message: string) => {
        try {
            let { boardId } = JSON.parse(message);
            let result = await boardDataPersistence[boardId].getBoardData();
            socket.emit('getBoardData', result);
        } catch(err) {
            const error = ConstError.safeConstructor(err as any);
            logger.error(`Error encountered when getting board data: ${error.message}`);
            socket.emit('getBoardData', error.getErrorResponse());
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
            const error = ConstError.safeConstructor(err as any);
            logger.error(`Error encountered when creating a block: ${error.message}`);
            socket.emit('createBlock', error.getErrorResponse());
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
            const error = ConstError.safeConstructor(err as any);
            logger.error(`Error encountered when setting block positions: ${error.message}`);
            socket.emit('setBlockPositions', error.getErrorResponse());
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
            const error = ConstError.safeConstructor(err as any);
            logger.error(`Error encountered when deleting blocks: ${error.message}`);
            socket.emit('deleteBlocks', error.getErrorResponse());
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
            const error = ConstError.safeConstructor(err as any);
            logger.error(`Error encountered when setting a block's parent: ${error.message}`);
            socket.emit('setBlockParent', error.getErrorResponse());
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
            const error = ConstError.safeConstructor(err as any);
            logger.error(`Error encountered when setting a block's content: ${error.message}`);
            socket.emit('setBlockContent', error.getErrorResponse());
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
            let template = boardDataPersistence[boardId].getBoardTemplate();
            projectDataPersistence?.addOrUpdateTemplate(boardId, template);
            io.in(boardId).emit('setClassificationDefinitions', result);
        } catch(err) {
            const error = ConstError.safeConstructor(err as any);
            logger.error(`Error encountered when setting the classification definitions: ${error.message}`);
            socket.emit('setClassificationDefinitions', error.getErrorResponse());
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
            const error = ConstError.safeConstructor(err as any);
            logger.error(`Error encountered when setting a classification on blocks: ${error.message}`);
            socket.emit('setClassificationOnBlocks', error.getErrorResponse());
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
            const error = ConstError.safeConstructor(err as any);
            logger.error(`Error encountered when setting field definitions on a block: ${error.message}`);
            socket.emit('setFieldDefinitions', error.getErrorResponse());
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
            const error = ConstError.safeConstructor(err as any);
            logger.error(`Error encountered when setting a field value on a block: ${error.message}`);
            socket.emit('setFieldOnBlocks', error.getErrorResponse());
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
            const error = ConstError.safeConstructor(err as any);
            logger.error(`Error encountered when saving a view: ${error.message}`);
            socket.emit('saveView', error.getErrorResponse());
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
            const error = ConstError.safeConstructor(err as any);
            logger.error(`Error encountered when deleting a view: ${error.message}`);
            socket.emit('deleteView', error.getErrorResponse());
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
            const error = ConstError.safeConstructor(err as any);
            logger.error(`Error encountered when setting a block's priority: ${error.message}`);
            socket.emit('setBlockPriority', error.getErrorResponse());
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
            const error = ConstError.safeConstructor(err as any);
            logger.error(`Error encountered when loading a view: ${error.message}`);
            socket.emit('loadView', error.getErrorResponse());
        }
    };
}
