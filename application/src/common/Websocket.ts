
import { reactive, ref } from 'vue';
import io, { Socket } from 'socket.io-client';

import { useVueModals } from 'mw-vue-modals';
import { useVueNotify } from 'mw-vue-notify';

import * as ErrorLogger from './ErrorLogger';
import { useStore } from '../ui/store/store';
import { useGeneralStore } from '../ui/store/GeneralStore';

// TODO-const : Re-enable all the actions
// import { GetBoardDataAction } from '../actions/WebsocketActions/GetBoardData';
// import { CreateNewEntity } from '../actions/WebsocketActions/CreateNewEntity';
// import { DeleteEntities } from '../actions/WebsocketActions/DeleteEntities';
// import { SetEntityParent } from '../actions/WebsocketActions/SetEntityParent';
// import { UpdateClassificationDefinitions } from '../actions/WebsocketActions/UpdateClassificationDefinitions';
// import { UpdateClassificationOnEntities } from '../actions/WebsocketActions/UpdateClassificationOnEntities';
// import { UpdateEntityContent } from '../actions/WebsocketActions/UpdateEntityContent';
// import { UpdateEntityPositions } from '../actions/WebsocketActions/UpdateEntityPositions';
// import { UpdateFieldDefinitions } from '../actions/WebsocketActions/UpdateFieldDefinitions';
// import { UpdateFieldValueOnEntities } from '../actions/WebsocketActions/UpdateFieldValueOnEntities';
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

    private outageNotificationId?: string;

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

    connectWebsocket(projectId: string, boardId: string): Promise<void> {
        this.openConnectionDialog();
        this.setConnectionDialogMessage('connecting...');

        return new Promise((resolve, reject) => {
            // TODO-later handle reject
            if (!this.isConnected()) {
                this.socket = io({
                    path: `/ws/app/${projectId}`,
                    transports: ['websocket'],
                    query: { clientVersion: WEBPACK.APP_VERSION }
                });

                // Make a parallel (or sequential?) web request to check for a planned outage. If one exists,
                // cease the WS connection attempt.
                // TODO-const : Re-enable all the actions
                // new GetOutageRequest()
                //     .send(({data}: any) => {
                //         if (data?.timestamp) {
                //             useVueNotify().showNotification({
                //                 cssClasses: [ 'mw-notification-failure' ],
                //                 position: 'middle-center',
                //                 dismissButton: false,
                //                 data: { message: "Due to a planned outage, we're currently not accepting new connections. Please try back in a few minutes." }
                //             });
                //             this.disconnectWebsocket();
                //         }
                //     });

                // Listen for incoming messages
                registerListeners(this.socket);

                // Once connected, one of the following two events will be called depending on the success
                // of the connection.
                this.socket.on('oldClient', () => {
                    isOutdated = true;
                    this.closeConnectionDialog();
                    useVueNotify().showNotification({
                        cssClasses: ['mw-notification-failure'],
                        data: { message: "You have an outdated client. Please refresh your browser to continue using Spacia." },
                        dismissButton: false,
                        dismissAfterMillis: 0,
                        position: 'middle-center'
                    });
                });
                this.socket.on('clientValidated', () => {
                    let authToken = useGeneralStore().authToken().value;
                    this.socket!.emit('subscribeToBoard', { boardId, authToken });

                    this.setConnectionDialogMessage('fetching data...');

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

    // ===================
    // Outage Notification
    // -------------------

    showOutageNotification(timestamp: number | undefined) {
        this.closeOutageNotification();
        if (timestamp) {
            this.outageNotificationId = useVueNotify().showNotification({
                cssClasses: [ 'mw-notification-warning' ],
                position: 'middle-center',
                data: { message: `Heads up! We planned a service outage for ${new Date(timestamp).toLocaleString()}. Outages usually last less than 15 minutes, during which you'll lose connection and will not be able to make any changes. We're sorry for this inconvenience!` },
            });
        }
    }
    closeOutageNotification(showBackMessage: boolean = false) {
        if (this.outageNotificationId) {
            useVueNotify().deleteNotification(this.outageNotificationId);
            if (showBackMessage) {
                this.outageNotificationId = useVueNotify().showNotification({
                    cssClasses: [ 'mw-notification-success' ],
                    position: 'top-center',
                    dismissAfterMillis: 2000,
                    data: { message: "And we're back!"},
                });
            }
        }
    }
}

export let ws = new Websocket();


// Copied from server's "AppDataInterface.ts". Keep these two locations in sync.
interface InitializationStatus {
    status: 'INITIALIZING' | 'NEEDS_RECOVERY' | 'RECOVERING' | 'OK' | 'FAILED';
}

function registerListeners(socket: Socket) {
    const DATA_RECOVERY_DIALOG_ID = "data-recovery";
    let dataRecoveryModal = {
        id: DATA_RECOVERY_DIALOG_ID,
        styleOverrides: { 'width': '600px' },
        layout: {
            componentName: 'mw-vm-no-layout',
            panes: {
                'main': {
                    componentName: 'eic-data-recovery-dialog',
                    eventHandlers: {
                        'mw-close-modal': () => { useVueModals().closeModal(DATA_RECOVERY_DIALOG_ID); }
                    }
                }
            }
        }
    }

    socket.on('initializationStatus', (data: InitializationStatus) => {

        if (data.status === 'OK') {
            // Refresh the board data
            let boardId = useGeneralStore().currentProjectBoard().value?.boardId;
            if (boardId) {
                // TODO-const : Re-enable all the actions
                // new GetBoardDataAction(boardId).send();
            } else {
                // App data initialized OK on the server, but locally we don't have a boardId
                ErrorLogger.showError('5.1.2');
            }
        } else if (data.status === 'FAILED') {
            useVueModals().createOrUpdateModal(dataRecoveryModal);
        } else if (['INITIALIZING', 'NEEDS_RECOVERY', 'RECOVERING'].includes(data.status)) {
            // We don't really care about these statuses (nor should we receive them).
            // Data recovery goes by so quickly, waiting for 'OK' and 'FAILED' should be enough.
        }
    });

    // TODO-const : Re-enable all the actions
    // socket.on('boardData', (data: any) => { ws.closeConnectionDialog(); ws.closeOutageNotification(true); GetBoardDataAction.processResponse(data); });
    // // -- Entity Data --
    // socket.on('updatedEntityPositions', (data: any) => { UpdateEntityPositions.processResponse(data); });
    // socket.on('updatedEntityContent',   (data: any) => { UpdateEntityContent.processResponse(data); });
    // socket.on('newEntity',              (data: any) => { CreateNewEntity.processResponse(data); });
    // socket.on('entitiesDeleted',        (data: any) => { DeleteEntities.processResponse(data); });
    // socket.on('parentEntitySet',        (data: any) => { SetEntityParent.processResponse(data); });
    // // -- Fields and Classifications --
    // socket.on('fieldDefinitions',          (data: any) => { UpdateFieldDefinitions.processResponse(data); });
    // socket.on('classificationDefinitions', (data: any) => { UpdateClassificationDefinitions.processResponse(data); });
    // socket.on('entityFieldValue',          (data: any) => { UpdateFieldValueOnEntities.processResponse(data); });
    // socket.on('entityClassifications',     (data: any) => { UpdateClassificationOnEntities.processResponse(data); });
    // // -- View Data --
    // socket.on('viewData',         (data: any) => { LoadViewData.processResponse(data); });
    // socket.on('viewSaved',        (data: any) => { SaveView.processResponse(data); });
    // socket.on('viewDeleted',      (data: any) => { DeleteView.processResponse(data); });
    // socket.on('blockPrioritySet', (data: any) => { SetBlockPriority.processResponse(data); });
    // -- Misc --
    socket.on('outage', (data: any) => { ws.showOutageNotification(data.timestamp); });
}