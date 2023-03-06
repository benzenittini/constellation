
import { useVueNotify } from "mw-vue-notify";

import { Action } from "../Action";
import { useStore } from '../../store/store';
import { DeleteViewResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { ws } from "../../communications/Websocket";

export class DeleteViewAction extends Action {

    private viewId: string;

    constructor(viewId: string) {
        super();

        this.viewId = viewId;
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('deleteView', JSON.stringify({
                boardId: useStore().state.generalData.currentProjectBoard!.boardId,
                viewId: this.viewId,
            }));
        } else {
            // If local project, make the IPC request
            window.board.deleteView({
                viewId: this.viewId,
            }).then((resp) => DeleteViewAction.processResponse(resp));
        }
    }

    static processResponse(resp: DeleteViewResponse): void {
        const store = useStore();

        if (store.state.viewData.activeViewConfig?.id === resp.viewId) {
            useVueNotify().showNotification({
                cssClasses: ['mw-notification-success'],
                dismissAfterMillis: 2500,
                data: { message: 'View deleted successfully!' },
                position: 'top-center',
            });
        }

        store.dispatch('deleteView', resp.viewId);
    }

}
