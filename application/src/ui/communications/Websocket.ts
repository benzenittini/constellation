
import { reactive } from 'vue';
import io, { Socket } from 'socket.io-client';

// import { io, Socket } from 'socket.io-client';
// const { io } = import('socket.io-client');
// import * as io from 'socket.io-client';
// import { io } from 'socket.io-client';

import { useVueModals } from 'mw-vue-modals';
import { useVueNotify } from 'mw-vue-notify';

import { RemoteProject, GENERIC_RESTART } from 'constellation-common/datatypes';

// -- Actions --
import { GetBoardDataAction } from '../actions/board-actions/GetBoardData';
import { CreateBlockAction } from '../actions/board-actions/CreateBlock';
import { DeleteBlocksAction } from '../actions/board-actions/DeleteBlocks';
import { SetBlockContentAction } from '../actions/board-actions/SetBlockContent';
import { SetBlockParentAction } from '../actions/board-actions/SetBlockParent';
import { SetBlockPositionsAction } from '../actions/board-actions/SetBlockPositions';
import { SetClassificationDefinitionsAction } from '../actions/board-actions/SetClassificationDefinitions';
import { SetClassificationOnBlocksAction } from '../actions/board-actions/SetClassificationOnBlocks';
import { SetFieldDefinitionsAction } from '../actions/board-actions/SetFieldDefinitions';
import { SetFieldOnBlocksAction } from '../actions/board-actions/SetFieldOnBlocks';
import { SaveViewAction } from '../actions/board-actions/SaveView';
import { DeleteViewAction } from '../actions/board-actions/DeleteView';
import { SetBlockPriorityAction } from '../actions/board-actions/SetBlockPriority';
import { LoadViewAction } from '../actions/board-actions/LoadView';
import { E31, showError } from '../ErrorLogger';
import { useStore } from '../store/store';


const WS_DIALOG_ID = 'ws-connecting-dialog';

let isOutdated = false;

class Websocket {

    private socket: Socket | undefined;
    private outdatedClientNotifId: string | undefined;

    isConnected(): boolean {
        return (this.socket !== undefined) && this.socket.connected;
    }

    emit(event: string, data: any) {
        if (!this.isConnected()) {
            // Attempted to emit a websocket event before connecting.
            showError(E31, [GENERIC_RESTART]);
        } else {
            this.socket!.emit(event, data);
        }
    }

    connectWebsocket(remote: RemoteProject, boardId: string): Promise<void> {
        this.openConnectionDialog();
        this.setConnectionDialogMessage('connecting...');

        return new Promise((resolve, reject) => {
            if (!this.isConnected()) {
                this.socket = io(remote.serverUrl, {
                    path: `/ws`,
                    transports: ['websocket'],
                    query: { clientVersion: WEBPACK.APP_VERSION },
                    auth: { token: remote.credentials },
                });

                // Listen for incoming messages
                registerListeners(this.socket);

                // Once connected, one of the following two events will be called depending on the success of the connection.
                this.socket.on('oldClient', (serverVersion) => {
                    isOutdated = true;
                    this.closeConnectionDialog();
                    this.outdatedClientNotifId = useVueNotify().showNotification({
                        cssClasses: ['mw-notification-failure'],
                        componentName: 'mw-vn-message-with-list',
                        data: {
                            message: `Version mismatch between client and server. Please synchronize the major versions to connect to this server.`,
                            items: [
                                `Client: ${WEBPACK.APP_VERSION}`,
                                `Server: ${serverVersion}`,
                            ]
                        },
                        dismissButton: false,
                        dismissAfterMillis: 0,
                        position: 'middle-center'
                    });
                });
                this.socket.on('clientValidated', () => {
                    this.socket!.emit('subscribeToBoard', { boardId });
                    this.setConnectionDialogMessage('fetching data...');
                    new GetBoardDataAction().submit();
                    resolve();
                });

                this.socket.on('disconnect', () => {
                    // Only re-open the "connecting" dialog if it wasn't hidden due to an outdated client.
                    if (!isOutdated) {
                        this.openConnectionDialog();
                        this.setConnectionDialogMessage('reconnecting...');
                    }
                });
            }
        });
    }

    disconnectWebsocket() {
        if (this.socket) {
            this.socket!.removeAllListeners();
            this.socket!.disconnect();
            this.closeConnectionDialog();
        }
    }

    // ======================
    // Data Connection Dialog
    // ----------------------

    public connectionDialogMessage = reactive({ mwMessage: '' });
    openConnectionDialog() {
        useVueModals().createOrUpdateModal({
            id: WS_DIALOG_ID,
            styleOverrides: { 'width': '400px', 'height': '200px' },
            layout: {
                componentName: 'mw-vm-no-layout',
                panes: {
                    'main': { componentName: 'eic-ws-connection-dialog', componentData: this.connectionDialogMessage }
                }
            }
        });
    }
    setConnectionDialogMessage(message: string) {
        this.connectionDialogMessage.mwMessage = message;
    }
    closeConnectionDialog() {
        useVueModals().closeModal(WS_DIALOG_ID);
    }

    closeOutdatedNotification() {
        if (this.outdatedClientNotifId) useVueNotify().deleteNotification(this.outdatedClientNotifId);
    }
}

export let ws = new Websocket();


function registerListeners(socket: Socket) {
    socket.on('getBoardData', (data: any) => { ws.closeConnectionDialog(); GetBoardDataAction.processResponse(data); });
    // -- Block Data --
    socket.on('createBlock',       (data: any) => { CreateBlockAction.processResponse(data); });
    socket.on('setBlockPositions', (data: any) => { SetBlockPositionsAction.processResponse(data); });
    socket.on('deleteBlocks',      (data: any) => { DeleteBlocksAction.processResponse(data); });
    socket.on('setBlockParent',    (data: any) => { SetBlockParentAction.processResponse(data); });
    socket.on('setBlockContent',   (data: any) => { SetBlockContentAction.processResponse(data); });
    // -- Fields and Classifications --
    socket.on('setClassificationDefinitions', (data: any) => { SetClassificationDefinitionsAction.processResponse(data); });
    socket.on('setClassificationOnBlocks',    (data: any) => { SetClassificationOnBlocksAction.processResponse(data); });
    socket.on('setFieldDefinitions',          (data: any) => { SetFieldDefinitionsAction.processResponse(data); });
    socket.on('setFieldOnBlocks',             (data: any) => { SetFieldOnBlocksAction.processResponse(data); });
    // -- View Data --
    socket.on('saveView',         (data: any) => { SaveViewAction.processResponse(data); });
    socket.on('deleteView',       (data: any) => { DeleteViewAction.processResponse(data); });
    socket.on('setBlockPriority', (data: any) => { SetBlockPriorityAction.processResponse(data); });
    socket.on('loadView',         (data: any) => { LoadViewAction.processResponse(data); });

    // -- Miscellaneous --
    socket.on('boardDeleted', (data: any) => {
        // Go back to "projects" page
        useStore().dispatch('clearBoardState');

        // Show notification
        useVueNotify().showNotification({
            cssClasses: ['mw-notification-failure'],
            dismissAfterMillis: 0,
            data: { message: "Board has been deleted by another user.", },
        });
    });
}