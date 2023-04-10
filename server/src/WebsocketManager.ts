

// namespaced by projectId
// rooms allow clients to subscribe to boards

// -- Third Party --
import { Server, Socket } from "socket.io";
import http from 'http';

// -- Internal --
import { ConstError } from "constellation-common";
import { VersionUtils } from "constellation-common";
import { logger } from "./Logger";
import * as WebsocketHandlers from './WebsocketHandlers';
import { verifyCreds } from "./UserDataPersistence";

// -- Singleton Management --
export let singleton: WebsocketManager;
export let initializeSingleton = (server: http.Server) => {
    singleton = new WebsocketManager(server);
}

const CURRENT_VERSION = new VersionUtils.Version(WEBPACK.APP_VERSION);

// -- The actual class implementation --
export class WebsocketManager {

    private io: Server;

    constructor(server: http.Server) {
        this.io = new Server(server, {
            path: `/ws`,
            serveClient: false,
        });

        this.io.on('connection', (socket) => { this.onIoConnection(socket); });
    }

    onIoConnection(socket: Socket): void {
        // First, check their client version. If it's old, then disconnect them and prompt them to refresh their page.
        let clientVersion = (socket.request as any)?._query?.clientVersion;
        if (CURRENT_VERSION.hasDifferentMajorVersionThan(clientVersion)) {
            socket.emit('oldClient', WEBPACK.APP_VERSION);
            socket.disconnect();
        } else {
            // Verify the user's auth token.
            let clientInfo = verifyCreds(socket.handshake.auth.token);
            if (!clientInfo) {
                socket.disconnect();
                logger.error("User with invalid credentials attempted to connect.");
                return;
            }
            socket.data.clientInfo = clientInfo;

            // All good. Let's save off the user.
            logger.info(`User established connection: [${clientInfo.clientName} - ${clientInfo.clientId}]`);
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
            throw new ConstError(3,
                undefined,
                ConstError.getLineId('WebsocketManager', 'onSocketSubscribeToBoard', 1),
                "An unknown error occurred when user subscribed to a board.");
        }
    }

    onSocketUnsubscribeFromBoard(socket: Socket, data: any): void {
        try {
            socket.leave(data.boardId);
        } catch (err) {
            throw new ConstError(3,
                undefined,
                ConstError.getLineId('WebsocketManager', 'onSocketUnsubscribeFromBoard', 1),
                "An unknown error occurred when user unsubscribed to a board.");
        }
    }

    registerApplicationHandlers(socket: Socket): void {
        socket.on('getBoardData', WebsocketHandlers.getBoardData(this.io, socket));
        // -- Blocks --
        socket.on('createBlock',       WebsocketHandlers.createBlock(this.io, socket));
        socket.on('setBlockPositions', WebsocketHandlers.setBlockPositions(this.io, socket));
        socket.on('deleteBlocks',      WebsocketHandlers.deleteBlocks(this.io, socket));
        socket.on('setBlockParent',    WebsocketHandlers.setBlockParent(this.io, socket));
        socket.on('setBlockContent',   WebsocketHandlers.setBlockContent(this.io, socket));
        // -- Fields and Classifications --
        socket.on('setClassificationDefinitions', WebsocketHandlers.setClassificationDefinitions(this.io, socket));
        socket.on('setClassificationOnBlocks',    WebsocketHandlers.setClassificationOnBlocks(this.io, socket));
        socket.on('setFieldDefinitions',          WebsocketHandlers.setFieldDefinitions(this.io, socket));
        socket.on('setFieldOnBlocks',             WebsocketHandlers.setFieldOnBlocks(this.io, socket));
        // -- Views --
        socket.on('saveView',         WebsocketHandlers.saveView(this.io, socket));
        socket.on('deleteView',       WebsocketHandlers.deleteView(this.io, socket));
        socket.on('setBlockPriority', WebsocketHandlers.setBlockPriority(this.io, socket));
        socket.on('loadView',         WebsocketHandlers.loadView(this.io, socket));
    }

    onSocketDisconnect(socket: Socket): void {
        logger.info(`User [${socket.data.clientInfo.clientName} - ${socket.data.clientInfo.clientId}] disconnected.`);
        socket.leave("all-users");
    }

    sendToAllClients(messageType: string, data: any, boardId: string = 'all-users'): void {
        this.io.in(boardId).emit(messageType, data);
    }

}
