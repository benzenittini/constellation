
import { useVueNotify } from "mw-vue-notify";

import { Action } from "../Action";
import { useStore } from '../../store/store';
import { DeleteViewResponse, GENERIC_RESTART } from 'constellation-common/datatypes';
import { ws } from "../../communications/Websocket";
import { E24, showError } from "../../ErrorLogger";

export class DeleteViewAction extends Action {

    private viewId: string;

    constructor(viewId: string) {
        super();

        this.viewId = viewId;
    }

    submit(): void {
        const store = useStore();
        const clientId = store.state.generalData.clientId;

        if (store.getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('deleteView', JSON.stringify({
                clientId,
                boardId: store.state.generalData.currentProjectBoard!.boardId,
                viewId: this.viewId,
            }));
        } else {
            // If local project, make the IPC request
            window.board.deleteView({
                clientId,
                viewId: this.viewId,
            }).then((resp) => DeleteViewAction.processResponse(resp));
        }
    }

    static processResponse(resp: DeleteViewResponse): void {
        if ('errorCode' in resp) {
            showError(E24, [resp.message || GENERIC_RESTART]);
        } else {
            const store = useStore();

            // Only show "success" notification if this was the user who created it.
            if (store.state.generalData.clientId === resp.clientId) {
                useVueNotify().showNotification({
                    cssClasses: ['mw-notification', 'success'],
                    dismissAfterMillis: 2500,
                    data: { message: 'View deleted successfully!' },
                    position: 'top-center',
                });
            }

            store.dispatch('deleteView', resp.viewId);
        }
    }

}
