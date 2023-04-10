
import { useVueNotify } from "mw-vue-notify";

import { Action } from "../Action";
import { useStore } from '../../store/store';
import { GENERIC_RESTART, SaveViewResponse, ViewConfig } from 'constellation-common/datatypes';
import { LoadViewAction } from "./LoadView";
import { ws } from "../../communications/Websocket";
import { E23, showError } from "../../ErrorLogger";

export class SaveViewAction extends Action {

    private viewConfig: ViewConfig;

    constructor(viewConfig: ViewConfig) {
        super();

        this.viewConfig = viewConfig;
    }

    submit(): void {
        const store = useStore();
        const clientId = store.state.generalData.clientId;

        if (store.getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('saveView', JSON.stringify({
                clientId,
                boardId: store.state.generalData.currentProjectBoard!.boardId,
                viewConfig: this.viewConfig,
            }));
        } else {
            // If local project, make the IPC request
            window.board.saveView({
                clientId,
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

            if (store.state.generalData.clientId === resp.clientId && store.state.viewData.activeViewConfig?.id === resp.baseViewConfig.id) {
                new LoadViewAction(resp.baseViewConfig.id).submit();

                if (store.state.generalData.clientId === resp.clientId) {
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

}
