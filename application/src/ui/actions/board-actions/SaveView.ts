
import { useVueNotify } from "mw-vue-notify";

import { Action } from "../Action";
import { useStore } from '../../store/store';
import { GENERIC_RESTART, SaveViewResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { ViewConfig } from "../../../../../common/DataTypes/ViewDataTypes";
import { LoadViewAction } from "./LoadView";
import { ws } from "../../communications/Websocket";
import { E23, showError } from "../../../common/ErrorLogger";

export class SaveViewAction extends Action {

    private viewConfig: ViewConfig;

    constructor(viewConfig: ViewConfig) {
        super();

        this.viewConfig = viewConfig;
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('saveView', JSON.stringify({
                boardId: useStore().state.generalData.currentProjectBoard!.boardId,
                viewConfig: this.viewConfig,
            }));
        } else {
            // If local project, make the IPC request
            window.board.saveView({
                viewConfig: this.viewConfig,
            }).then((resp) => SaveViewAction.processResponse(resp));
        }
    }

    static processResponse(resp: SaveViewResponse): void {
        if ('errorCode' in resp) {
            showError(E23, [resp.message || GENERIC_RESTART]);
        } else {
            const store = useStore();

            store.dispatch('addView', resp.baseViewConfig);

            if (store.state.viewData.activeViewConfig?.id === resp.baseViewConfig.id) {
                new LoadViewAction(resp.baseViewConfig.id).submit();

                // Only show "success" notification if this was the user who created it.
                useVueNotify().showNotification({
                    cssClasses: ['mw-notification-success'],
                    dismissAfterMillis: 2500,
                    data: { message: 'View saved successfully!' },
                    position: 'top-center',
                });
            }
        }
    }

}
