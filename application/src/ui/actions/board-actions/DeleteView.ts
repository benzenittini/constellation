
import { useVueNotify } from "mw-vue-notify";

import { Action } from "../Action";
import { useStore } from '../../store/store';
import { DeleteViewResponse } from "../../../../../common/DataTypes/ActionDataTypes";

export class DeleteViewAction extends Action {

    private viewId: string;

    constructor(viewId: string) {
        super();

        this.viewId = viewId;
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            // TODO-const : Send action over websocket
        } else {
            // If local project, make the IPC request
            window.board.deleteView({
                viewId: this.viewId,
            }).then((resp) => this.processResponse(resp));
        }
    }

    processResponse(resp: DeleteViewResponse): void {
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
