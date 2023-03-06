
import { reactive, ref } from 'vue';
import io, { Socket } from 'socket.io-client';

import { useVueModals } from 'mw-vue-modals';
import { useVueNotify } from 'mw-vue-notify';

import * as ErrorLogger from '../../common/ErrorLogger';
import { useStore } from '../store/store';
import { RemoteProject } from '../../../../common/DataTypes/FileDataTypes';

// TODO-const : Re-enable all the actions
// import { GetBoardDataAction } from '../actions/WebsocketActions/GetBoardData';
// import { CreateNewBlock } from '../actions/WebsocketActions/CreateNewBlock';
// import { DeleteBlocks } from '../actions/WebsocketActions/DeleteBlocks';
// import { SetBlockParent } from '../actions/WebsocketActions/SetBlockParent';
// import { UpdateClassificationDefinitions } from '../actions/WebsocketActions/UpdateClassificationDefinitions';
// import { UpdateClassificationOnBlocks } from '../actions/WebsocketActions/UpdateClassificationOnBlocks';
// import { UpdateBlockContent } from '../actions/WebsocketActions/UpdateBlockContent';
// import { UpdateBlockPositions } from '../actions/WebsocketActions/UpdateBlockPositions';
// import { UpdateFieldDefinitions } from '../actions/WebsocketActions/UpdateFieldDefinitions';
// import { UpdateFieldValueOnBlocks } from '../actions/WebsocketActions/UpdateFieldValueOnBlocks';
// import { LoadViewData } from '../actions/WebsocketActions/LoadViewData';
// import { SaveView } from '../actions/WebsocketActions/SaveView';
// import { DeleteView } from '../actions/WebsocketActions/DeleteView';
// import { SetBlockPriority } from '../actions/WebsocketActions/SetBlockPriority';
// import { GetOutageRequest } from '../actions/RestActions/GetOutage';

const WS_DIALOG_ID = 'ws-connecting-dialog';

let store = useStore();

let isOutdated = false;

class Websocket {

    private socket: Socket | undefined;

    isConnected(): boolean {
        return (this.socket !== undefined) && this.socket.connected;
    }

    emit(event: string, data: any) {
        if (!this.isConnected()) {
            // Attempted to emit a websocket event before connecting.
            ErrorLogger.showError('5.1.1');
        } else {
            this.socket!.emit(event, data);
        }
    }

    connectWebsocket(remote: RemoteProject, boardId: string): Promise<void> {
        this.openConnectionDialog();
        this.setConnectionDialogMessage('connecting...');

        return new Promise((resolve, reject) => {
            // TODO-later handle reject
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
                this.socket.on('oldClient', () => {
                    isOutdated = true;
                    this.closeConnectionDialog();
                    useVueNotify().showNotification({
                        cssClasses: ['mw-notification-failure'],
                        data: { message: "You have an outdated client. Please update your app to connect to this server." },
                        dismissButton: false,
                        dismissAfterMillis: 0,
                        position: 'middle-center'
                    });
                });
                this.socket.on('clientValidated', () => {
                    this.socket!.emit('subscribeToBoard', { boardId });
                    this.setConnectionDialogMessage('fetching data...');
                    // TODO-const : Re-enable all the actions
                    // new GetBoardDataAction(boardId).send();
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
}

export let ws = new Websocket();


function registerListeners(socket: Socket) {
    // TODO-const : Re-enable all the actions
    // socket.on('boardData', (data: any) => { ws.closeConnectionDialog(); ws.closeOutageNotification(true); GetBoardDataAction.processResponse(data); });
    // // -- Block Data --
    // socket.on('updatedBlockPositions', (data: any) => { UpdateBlockPositions.processResponse(data); });
    // socket.on('updatedBlockContent',   (data: any) => { UpdateBlockContent.processResponse(data); });
    // socket.on('newBlock',              (data: any) => { CreateNewBlock.processResponse(data); });
    // socket.on('blocksDeleted',         (data: any) => { DeleteBlocks.processResponse(data); });
    // socket.on('parentBlockSet',        (data: any) => { SetBlockParent.processResponse(data); });
    // // -- Fields and Classifications --
    // socket.on('fieldDefinitions',          (data: any) => { UpdateFieldDefinitions.processResponse(data); });
    // socket.on('classificationDefinitions', (data: any) => { UpdateClassificationDefinitions.processResponse(data); });
    // socket.on('blockFieldValue',           (data: any) => { UpdateFieldValueOnBlocks.processResponse(data); });
    // socket.on('blockClassifications',      (data: any) => { UpdateClassificationOnBlocks.processResponse(data); });
    // // -- View Data --
    // socket.on('viewData',         (data: any) => { LoadViewData.processResponse(data); });
    // socket.on('viewSaved',        (data: any) => { SaveView.processResponse(data); });
    // socket.on('viewDeleted',      (data: any) => { DeleteView.processResponse(data); });
    // socket.on('blockPrioritySet', (data: any) => { SetBlockPriority.processResponse(data); });
}