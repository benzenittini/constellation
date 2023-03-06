
import { Socket, Server } from 'socket.io';


// =================
// Utility Functions
// -----------------

// TODO-const : Is this needed, or can it be deleted?
function getUserId(socket: Socket): string {
    return '';
    // let clientData = ClientMap.getClientData(socket.id);
    // if (!clientData || StringUtils.isBlank(clientData.userId)) {
    //     // A user without valid ClientData should never have access to this, but if they somehow do, cut them off.
    //     socket.disconnect();
    //     throw new TopError('2.1.0', Severity.HIGH,
    //         'User without a valid ClientData object attempted to perform a websocket action.',
    //         UserErrors.INTERNAL_ERROR);
    // }
    // return clientData.userId;
}


// ================
// Message Handlers
// ----------------
// Note: The below function names correspond to action names.

export function getBoardData(io: Server, socket: Socket) {
    return async (message: string) => {
        // TODO-const : WS handler
        // let requestorUserId = undefined;
        // try {
        //     requestorUserId = getUserId(socket);
        //     let parsedMessage;
        //     try {
        //         parsedMessage = JSON.parse(message);
        //     } catch (err) {
        //         throw new TopError('2.1.2', Severity.MEDIUM,
        //             `When getting board data, failed to parse the provided message. requestorUserId: ${requestorUserId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        //     let authToken = parsedMessage.authToken;
        //     let actionData: GetBoardDataActionData = {
        //         boardId: parsedMessage.boardId,
        //     }

        //     // Process the request, and return the response
        //     let projectResponse = <GetBoardDataResponse> await ProcessorSingleton.process(new GetBoardDataRequest(requestorUserId, authToken, actionData));
        //     socket.emit('boardData', projectResponse.getJsonResponse());
        // } catch(err) {
        //     if (!(err instanceof TopError)) {
        //         err = new TopError('2.1.1', Severity.HIGH,
        //             `An unknown error occurred when getting board data for a user. requestorUserId: ${requestorUserId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR, err);
        //     }
        //     if (socket.connected) {
        //         socket.emit('boardData', GetBoardDataResponse.createFailedResponse(1, (err as TopError).clientMessage).getJsonResponse());
        //     }
        // }
    }

}


// ===============
// Entity Handlers
// ---------------

export function updateEntityPositions(io: Server, socket: Socket) {
    return async (message: string) => {
        // TODO-const : WS handler
        // let userId = undefined;
        // try {
        //     userId = getUserId(socket);
        //     let parsedMessage;
        //     try {
        //         parsedMessage = JSON.parse(message);
        //     } catch (err) {
        //         throw new TopError('2.1.3', Severity.MEDIUM,
        //             `When updating entity positions, failed to parse the provided message. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        //     let authToken = parsedMessage.authToken;
        //     let actionData: UpdateEntityPositionsActionData = {
        //         boardId: parsedMessage.boardId,
        //         entityIdAndLocations: parsedMessage.entitiesAndPositions,
        //     }

        //     // Process the request, and return the response
        //     let response = <UpdateEntityPositionsResponse> await ProcessorSingleton.process(new UpdateEntityPositionsRequest(userId, authToken, actionData));
        //     socket.broadcast.in(actionData.boardId).emit('updatedEntityPositions', response.getJsonResponse());
        // } catch(err) {
        //     if (!(err instanceof TopError)) {
        //         err = new TopError('2.1.4', Severity.HIGH,
        //             `An unknown error occurred when updating entity positions. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR, err);
        //     }
        //     if (socket.connected) {
        //         socket.emit('updatedEntityPositions', UpdateEntityPositionsResponse.createFailedResponse(1, (err as TopError).clientMessage).getJsonResponse());
        //     }
        // }
    }

}

export function updateEntityContent(io: Server, socket: Socket) {
    return async (message: string) => {
        // TODO-const : WS handler
        // let userId = undefined;
        // try {
        //     userId = getUserId(socket);
        //     let parsedMessage;
        //     try {
        //         parsedMessage = JSON.parse(message);
        //     } catch (err) {
        //         throw new TopError('2.1.5', Severity.MEDIUM,
        //             `When updating entity content, failed to parse the provided message. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        //     let authToken = parsedMessage.authToken;
        //     let actionData: UpdateEntityContentActionData = {
        //         boardId: parsedMessage.boardId,
        //         entityId: parsedMessage.entityId,
        //         content: parsedMessage.content,
        //     }

        //     // Process the request, and return the response
        //     let response = <UpdateEntityContentResponse> await ProcessorSingleton.process(new UpdateEntityContentRequest(userId, authToken, actionData));
        //     socket.broadcast.in(actionData.boardId).emit('updatedEntityContent', response.getJsonResponse());
        // } catch(err) {
        //     if (!(err instanceof TopError)) {
        //         err = new TopError('2.1.6', Severity.HIGH,
        //             `An unknown error occurred when updating entity content. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR, err);
        //     }
        //     if (socket.connected) {
        //         socket.emit('updatedEntityContent', UpdateEntityContentResponse.createFailedResponse(1, (err as TopError).clientMessage).getJsonResponse());
        //     }
        // }
    }

}

export function createNewEntity(io: Server, socket: Socket) {
    return async (message: string) => {
        // TODO-const : WS handler
        // let userId = undefined;
        // try {
        //     userId = getUserId(socket);
        //     let parsedMessage;
        //     try {
        //         parsedMessage = JSON.parse(message);
        //     } catch (err) {
        //         throw new TopError('2.1.7', Severity.MEDIUM,
        //             `When creating a new entity, failed to parse the provided message. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }

        //     let actionData: CreateEntityActionData = {
        //         boardId: parsedMessage.boardId,
        //         parentEntityId: parsedMessage.parentEntityId,
        //         xLoc: parsedMessage.location.x,
        //         yLoc: parsedMessage.location.y,
        //         width: parsedMessage.location.width,
        //         height: parsedMessage.location.height,
        //         content: parsedMessage.content,
        //     }

        //     let authToken = parsedMessage.authToken;

        //     // entityId can be passed in _purely_ for testing purposes. Should not be done in prod.
        //     if (process.env.RUNNING_TESTS === 'true') {
        //         actionData.id = parsedMessage.entityId;
        //     }

        //     // Process the request, and return the response
        //     let response = <CreateEntityResponse> await ProcessorSingleton.process(new CreateEntityRequest(userId, authToken, actionData));
        //     socket.broadcast.in(actionData.boardId).emit('newEntity', response.getJsonResponse());
        //     // This sends the new entity back to the requesting client. We technically don't need to do this, but it makes it so we don't need
        //     // to re-define all the entity defaults client-side. It'll just receive/set whatever it receives here from the server.
        //     socket.emit('newEntity', response.getJsonResponse());
        // } catch(err) {
        //     if (!(err instanceof TopError)) {
        //         err = new TopError('2.1.8', Severity.HIGH,
        //             `An unknown error occurred when creating a new entity. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR, err);
        //     }
        //     if (socket.connected) {
        //         socket.emit('newEntity', CreateEntityResponse.createFailedResponse(1, (err as TopError).clientMessage).getJsonResponse());
        //     }
        // }
    }

}

export function deleteEntities(io: Server, socket: Socket) {
    return async (message: string) => {
        // TODO-const : WS handler
        // let userId = undefined;
        // try {
        //     userId = getUserId(socket);
        //     let parsedMessage;
        //     try {
        //         parsedMessage = JSON.parse(message);
        //     } catch (err) {
        //         throw new TopError('2.1.9', Severity.MEDIUM,
        //             `When deleting entities, failed to parse the provided message. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        //     let authToken = parsedMessage.authToken;
        //     let actionData: DeleteEntitiesActionData = {
        //         boardId: parsedMessage.boardId,
        //         entityIds: parsedMessage.entityIds
        //     }

        //     // Process the request, and return the response
        //     let response = <DeleteEntitiesResponse> await ProcessorSingleton.process(new DeleteEntitiesRequest(userId, authToken, actionData));
        //     socket.broadcast.in(actionData.boardId).emit('entitiesDeleted', response.getJsonResponse());
        // } catch(err) {
        //     if (!(err instanceof TopError)) {
        //         err = new TopError('2.1.10', Severity.HIGH,
        //             `An unknown error occurred when deleting entities. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR, err);
        //     }
        //     if (socket.connected) {
        //         socket.emit('entitiesDeleted', DeleteEntitiesResponse.createFailedResponse(1, (err as TopError).clientMessage).getJsonResponse());
        //     }
        // }
    }

}

export function setEntityParent(io: Server, socket: Socket) {
    return async (message: string) => {
        // TODO-const : WS handler
        // let userId = undefined;
        // try {
        //     userId = getUserId(socket);
        //     let parsedMessage;
        //     try {
        //         parsedMessage = JSON.parse(message);
        //     } catch (err) {
        //         throw new TopError('2.1.11', Severity.MEDIUM,
        //             `When setting an entity's parent, failed to parse the provided message. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        //     let authToken = parsedMessage.authToken;
        //     let actionData: SetEntityParentActionData = {
        //         boardId: parsedMessage.boardId,
        //         entityId: parsedMessage.entityId,
        //         parentEntityId: parsedMessage.parentEntityId,
        //     }

        //     // Process the request, and return the response
        //     let response = <SetEntityParentResponse> await ProcessorSingleton.process(new SetEntityParentRequest(userId, authToken, actionData));
        //     socket.broadcast.in(actionData.boardId).emit('parentEntitySet', response.getJsonResponse());
        // } catch(err) {
        //     if (!(err instanceof TopError)) {
        //         err = new TopError('2.1.12', Severity.HIGH,
        //             `An unknown error occurred when setting an entity's parent. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR, err);
        //     }
        //     if (socket.connected) {
        //         socket.emit('parentEntitySet', SetEntityParentResponse.createFailedResponse(1, (err as TopError).clientMessage).getJsonResponse());
        //     }
        // }
    }
}


// ==========================
// Fields and Classifications
// --------------------------

export function updateClassificationOnEntities(io: Server, socket: Socket) {
    return async (message: string) => {
        // TODO-const : WS handler
        // let userId = undefined;
        // try {
        //     userId = getUserId(socket);
        //     let parsedMessage;
        //     try {
        //         parsedMessage = JSON.parse(message);
        //     } catch (err) {
        //         throw new TopError('2.1.13', Severity.MEDIUM,
        //             `When setting some entities' classifications, failed to parse the provided message. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        //     let authToken = parsedMessage.authToken;
        //     let actionData: UpdateClassificationOnEntitiesActionData = {
        //         boardId: parsedMessage.boardId,
        //         entityIds: parsedMessage.entityIds,
        //         classificationId: parsedMessage.classificationId,
        //         isActive: parsedMessage.isActive,
        //     }

        //     // Process the request, and return the response
        //     let response = <UpdateClassificationOnEntitiesResponse> await ProcessorSingleton.process(new UpdateClassificationOnEntitiesRequest(userId, authToken, actionData));
        //     // This sends the response to everyone, including the original sender.
        //     socket.emit('entityClassifications', response.getJsonResponse());
        //     socket.broadcast.in(actionData.boardId).emit('entityClassifications', response.getJsonResponse());
        // } catch(err) {
        //     if (!(err instanceof TopError)) {
        //         err = new TopError('2.1.14', Severity.HIGH,
        //             `An unknown error occurred when setting some entities' classifications. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR, err);
        //     }
        //     if (socket.connected) {
        //         socket.emit('entityClassifications', UpdateClassificationOnEntitiesResponse.createFailedResponse(1, (err as TopError).clientMessage).getJsonResponse());
        //     }
        // }
    }
}

export function updateFieldDefinitions(io: Server, socket: Socket) {
    return async (message: string) => {
        // TODO-const : WS handler
        // let userId = undefined;
        // try {
        //     userId = getUserId(socket);
        //     let parsedMessage;
        //     try {
        //         parsedMessage = JSON.parse(message);
        //     } catch (err) {
        //         throw new TopError('2.1.15', Severity.MEDIUM,
        //             `When setting an entity's field definitions, failed to parse the provided message. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        //     let authToken: string = parsedMessage.authToken;
        //     let actionData: UpdateFieldDefinitionsActionData = {
        //         boardId: parsedMessage.boardId,
        //         entityIds: parsedMessage.entityIds,

        //         fieldDefinitions: parsedMessage.fieldDefinitions,
        //         fieldIds: parsedMessage.fieldIds,
        //         possibleValueDefinitions: parsedMessage.possibleValueDefinitions,
        //         deletedFieldIds: parsedMessage.deletedFieldIds,
        //     }

        //     // Process the request, and return the response
        //     let response = <UpdateFieldDefinitionsResponse> await ProcessorSingleton.process(new UpdateFieldDefinitionsRequest(userId, authToken, actionData));
        //     // This sends the response to everyone, including the original sender.
        //     socket.broadcast.in(actionData.boardId).emit('fieldDefinitions', response.getJsonResponse());
        //     socket.emit('fieldDefinitions', response.getJsonResponse());
        // } catch(err) {
        //     if (!(err instanceof TopError)) {
        //         err = new TopError('2.1.16', Severity.HIGH,
        //             `An unknown error occurred when setting an entity's field definitions. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR, err);
        //     }
        //     if (socket.connected) {
        //         socket.emit('fieldDefinitions', UpdateFieldDefinitionsResponse.createFailedResponse(1, (err as TopError).clientMessage).getJsonResponse());
        //     }
        // }
    }
}

export function updateFieldValueOnEntities(io: Server, socket: Socket) {
    return async (message: string) => {
        // TODO-const : WS handler
        // let userId = undefined;
        // try {
        //     userId = getUserId(socket);
        //     let parsedMessage;
        //     try {
        //         parsedMessage = JSON.parse(message);
        //     } catch (err) {
        //         throw new TopError('2.1.17', Severity.MEDIUM,
        //             `When setting an entity's field value, failed to parse the provided message. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        //     let authToken = parsedMessage.authToken;
        //     let actionData: UpdateFieldValueOnEntitiesActionData = {
        //         boardId: parsedMessage.boardId,
        //         fieldId: parsedMessage.fieldId,
        //         entityIdToFieldValue: parsedMessage.entityIdToFieldValue,
        //     }

        //     // Process the request, and return the response
        //     let response = <UpdateFieldValueOnEntitiesResponse> await ProcessorSingleton.process(new UpdateFieldValueOnEntitiesRequest(userId, authToken, actionData));
        //     // This sends the response to everyone, including the original sender.
        //     socket.broadcast.in(actionData.boardId).emit('entityFieldValue', response.getJsonResponse());
        //     socket.emit('entityFieldValue', response.getJsonResponse());
        // } catch(err) {
        //     if (!(err instanceof TopError)) {
        //         err = new TopError('2.1.18', Severity.HIGH,
        //             `An unknown error occurred when setting an entity's field value. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR, err);
        //     }
        //     if (socket.connected) {
        //         socket.emit('entityFieldValue', UpdateFieldValueOnEntitiesResponse.createFailedResponse(1, (err as TopError).clientMessage).getJsonResponse());
        //     }
        // }
    }
}

export function updateClassificationDefinitions(io: Server, socket: Socket) {
    return async (message: string) => {
        // TODO-const : WS handler
        // let userId = undefined;
        // try {
        //     userId = getUserId(socket);
        //     let parsedMessage;
        //     try {
        //         parsedMessage = JSON.parse(message);
        //     } catch (err) {
        //         throw new TopError('2.1.19', Severity.MEDIUM,
        //             `When setting a board's classification definitions, failed to parse the provided message. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        //     let authToken = parsedMessage.authToken;
        //     let actionData: UpdateClassificationDefinitionsActionData = {
        //         boardId: parsedMessage.boardId,
        //         classificationIds: parsedMessage.classificationIds,
        //         classifications: parsedMessage.classifications,
        //         fields: parsedMessage.fields,
        //         possibleValues: parsedMessage.possibleValues,
        //     }

        //     // Process the request, and return the response
        //     let response = <UpdateClassificationDefinitionsResponse> await ProcessorSingleton.process(new UpdateClassificationDefinitionsRequest(userId, authToken, actionData));
        //     // This sends the response to everyone, including the original sender.
        //     socket.emit('classificationDefinitions', response.getJsonResponse());
        //     socket.broadcast.in(actionData.boardId).emit('classificationDefinitions', response.getJsonResponse());
        // } catch(err) {
        //     if (!(err instanceof TopError)) {
        //         err = new TopError('2.1.20', Severity.HIGH,
        //             `An unknown error occurred when setting a board's classification definitions. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR, err);
        //     }
        //     if (socket.connected) {
        //         socket.emit('classificationDefinitions', UpdateClassificationDefinitionsResponse.createFailedResponse(1, (err as TopError).clientMessage).getJsonResponse());
        //     }
        // }
    }
}


// =============
// View Handlers
// -------------

// TODO-kanban : Sanitize all the action data values in these ViewHandlers

export function loadViewData(io: Server, socket: Socket) {
    return async (message: string) => {
        // TODO-const : WS handler
        // let userId = undefined;
        // try {
        //     userId = getUserId(socket);
        //     let parsedMessage;
        //     try {
        //         parsedMessage = JSON.parse(message);
        //     } catch (err) {
        //         throw new TopError('2.1.21', Severity.MEDIUM,
        //             `When loading a view's data, failed to parse the provided message. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        //     let authToken = parsedMessage.authToken;
        //     let actionData: LoadViewDataActionData = {
        //         boardId: parsedMessage.boardId,
        //         viewId: parsedMessage.viewId,
        //     }

        //     // Process the request, and return the response
        //     let response = <LoadViewDataResponse> await ProcessorSingleton.process(new LoadViewDataRequest(userId, authToken, actionData));
        //     socket.emit('viewData', response.getJsonResponse());
        // } catch(err) {
        //     if (!(err instanceof TopError)) {
        //         err = new TopError('2.1.22', Severity.HIGH,
        //             `An unknown error occurred when loading a view's data. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR, err);
        //     }
        //     if (socket.connected) {
        //         socket.emit('viewData', LoadViewDataResponse.createFailedResponse(1, (err as TopError).clientMessage).getJsonResponse());
        //     }
        // }
    }
}

export function saveView(io: Server, socket: Socket) {
    return async (message: string) => {
        // TODO-const : WS handler
        // let userId = undefined;
        // try {
        //     userId = getUserId(socket);
        //     let parsedMessage;
        //     try {
        //         parsedMessage = JSON.parse(message);
        //     } catch (err) {
        //         throw new TopError('2.1.23', Severity.MEDIUM,
        //             `When saving a view, failed to parse the provided message. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        //     let authToken = parsedMessage.authToken;
        //     let actionData: SaveViewActionData = {
        //         boardId: parsedMessage.boardId,
        //         viewConfig: parsedMessage.viewConfig,
        //     }

        //     // Process the request, and return the response
        //     let response = <SaveViewResponse> await ProcessorSingleton.process(new SaveViewRequest(userId, authToken, actionData));
        //     // This sends the response to everyone, including the original sender.
        //     socket.emit('viewSaved', response.getJsonResponse());
        //     socket.broadcast.in(actionData.boardId).emit('viewSaved', response.getJsonResponse());
        // } catch(err) {
        //     if (!(err instanceof TopError)) {
        //         err = new TopError('2.1.24', Severity.HIGH,
        //             `An unknown error occurred when saving a view. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR, err);
        //     }
        //     if (socket.connected) {
        //         socket.emit('viewSaved', SaveViewResponse.createFailedResponse(1, (err as TopError).clientMessage).getJsonResponse());
        //     }
        // }
    }
}

export function deleteView(io: Server, socket: Socket) {
    return async (message: string) => {
        // TODO-const : WS handler
        // let userId = undefined;
        // try {
        //     userId = getUserId(socket);
        //     let parsedMessage;
        //     try {
        //         parsedMessage = JSON.parse(message);
        //     } catch (err) {
        //         throw new TopError('2.1.25', Severity.MEDIUM,
        //             `When deleting a view, failed to parse the provided message. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        //     let authToken = parsedMessage.authToken;
        //     let actionData: DeleteViewActionData = {
        //         boardId: parsedMessage.boardId,
        //         viewId: parsedMessage.viewId,
        //     }

        //     // Process the request, and return the response
        //     let response = <DeleteViewResponse> await ProcessorSingleton.process(new DeleteViewRequest(userId, authToken, actionData));
        //     // This sends the response to everyone, including the original sender.
        //     socket.emit('viewDeleted', response.getJsonResponse());
        //     socket.broadcast.in(actionData.boardId).emit('viewDeleted', response.getJsonResponse());
        // } catch(err) {
        //     if (!(err instanceof TopError)) {
        //         err = new TopError('2.1.26', Severity.HIGH,
        //             `An unknown error occurred when deleting a view. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR, err);
        //     }
        //     if (socket.connected) {
        //         socket.emit('viewDeleted', DeleteViewResponse.createFailedResponse(1, (err as TopError).clientMessage).getJsonResponse());
        //     }
        // }
    }
}

export function setBlockPriority(io: Server, socket: Socket) {
    return async (message: string) => {
        // TODO-const : WS handler
        // let userId = undefined;
        // try {
        //     userId = getUserId(socket);
        //     let parsedMessage;
        //     try {
        //         parsedMessage = JSON.parse(message);
        //     } catch (err) {
        //         throw new TopError('2.1.27', Severity.MEDIUM,
        //             `When updating a view's block priority, failed to parse the provided message. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR);
        //     }
        //     let authToken = parsedMessage.authToken;
        //     let actionData: SetBlockPriorityActionData = {
        //         boardId: parsedMessage.boardId,
        //         blockId: parsedMessage.blockId,
        //         beforeId: parsedMessage.beforeId,
        //     }

        //     // Process the request, and return the response
        //     let response = <SetBlockPriorityResponse> await ProcessorSingleton.process(new SetBlockPriorityRequest(userId, authToken, actionData));
        //     // This sends the response to everyone, including the original sender.
        //     socket.emit('blockPrioritySet', response.getJsonResponse());
        //     socket.broadcast.in(actionData.boardId).emit('blockPrioritySet', response.getJsonResponse());
        // } catch(err) {
        //     if (!(err instanceof TopError)) {
        //         err = new TopError('2.1.28', Severity.HIGH,
        //             `An unknown error occurred when updating a view's block priority. userId: ${userId}, inboundMessage: ${message}`,
        //             UserErrors.INTERNAL_ERROR, err);
        //     }
        //     if (socket.connected) {
        //         socket.emit('blockPrioritySet', SetBlockPriorityResponse.createFailedResponse(1, (err as TopError).clientMessage).getJsonResponse());
        //     }
        // }
    }
}