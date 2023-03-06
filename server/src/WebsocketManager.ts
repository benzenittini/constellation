

// namespaced by projectId
// rooms allow clients to subscribe to boards

// -- Third Party --
import { Server, Socket } from "socket.io";
import http from 'http';

// -- Internal --
import { logger } from "./Logger";
import * as WebsocketHandlers from './WebsocketHandlers';

// -- Singleton Management --
export let singleton: WebsocketManager;
export let initializeSingleton = (server: http.Server) => {
    singleton = new WebsocketManager(server);
}

// -- The actual class implementation --
export class WebsocketManager {

    private io: Server;

    constructor(server: http.Server) {
        this.io = new Server(server, {
            path: `/ws`,
            serveClient: false,
            transports: ['websocket'],
        });

        this.io.on('connection', (socket) => { this.onIoConnection(socket); });
    }

    onIoConnection(socket: Socket): void {
        // First, check their client version. If it's old, then disconnect them and prompt them to refresh their page.
        let clientVersion = (socket.request as any)?._query?.clientVersion;
        if (WEBPACK.APP_VERSION !== clientVersion) {
            socket.emit('oldClient');
            socket.disconnect();
        } else {
            // Verify the user's auth token.
            let token = socket.handshake.auth.token;
            console.log(`User connected with token: ${token}`);
            // TODO-const
            let clientId = '';

            // All good. Let's save off the user.
            logger.info(`User established connection. userId: ${clientId}`);
            socket.join("all-users");

            // Register socket events
            socket.on('disconnect', () => this.onSocketDisconnect(socket));
            socket.on('subscribeToBoard', (data) => this.onSocketSubscribeToBoard(socket, data));
            socket.on('unsubscribeFromBoard', (data) => this.onSocketUnsubscribeFromBoard(socket, data));
            this.registerApplicationHandlers(socket);

            // Let the client know they're good to continue.
            socket.emit('clientValidated');
        }
    }

    async onSocketSubscribeToBoard(socket: Socket, data: any): Promise<void> {
        try {
            socket.join(data.boardId);
        } catch (err) {
            // TODO-const : Error handling
            throw new Error("An unknown error occurred when user subscribed to a board.");
        }
    }

    onSocketUnsubscribeFromBoard(socket: Socket, data: any): void {
        try {
            socket.leave(data.boardId);
        } catch (err) {
            // TODO-const : Error handling
            throw new Error("An unknown error occurred when user unsubscribed to a board.");
        }
    }

    registerApplicationHandlers(socket: Socket): void {
        socket.on('getBoardData', WebsocketHandlers.getBoardData(this.io, socket));
        // Entities
        socket.on('updateEntityPositions', WebsocketHandlers.updateEntityPositions(this.io, socket));
        socket.on('updateEntityContent',   WebsocketHandlers.updateEntityContent(this.io, socket));
        socket.on('createNewEntity',       WebsocketHandlers.createNewEntity(this.io, socket));
        socket.on('deleteEntities',        WebsocketHandlers.deleteEntities(this.io, socket));
        socket.on('setEntityParent',       WebsocketHandlers.setEntityParent(this.io, socket));
        // Fields & Classifications
        socket.on('updateClassificationOnEntities',  WebsocketHandlers.updateClassificationOnEntities(this.io, socket));
        socket.on('updateFieldDefinitions',          WebsocketHandlers.updateFieldDefinitions(this.io, socket));
        socket.on('updateFieldValueOnEntities',      WebsocketHandlers.updateFieldValueOnEntities(this.io, socket));
        socket.on('updateClassificationDefinitions', WebsocketHandlers.updateClassificationDefinitions(this.io, socket));
        // Views
        socket.on('loadViewData',      WebsocketHandlers.loadViewData(this.io, socket));
        socket.on('saveView',          WebsocketHandlers.saveView(this.io, socket));
        socket.on('deleteView',        WebsocketHandlers.deleteView(this.io, socket));
        socket.on('setBlockPriority',  WebsocketHandlers.setBlockPriority(this.io, socket));
    }

    onSocketDisconnect(socket: Socket): void {
        // TODO-const : Populate the clientId..? (or remove from the log message?)
        let clientId = '';
        logger.info(`User with id ${clientId} disconnected.`);
        socket.leave("all-users");
    }

    sendToAllClients(messageType: string, data: any): void {
        this.io.in('all-users').emit(messageType, data);
    }

}
