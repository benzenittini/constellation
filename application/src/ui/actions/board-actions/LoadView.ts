
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { GENERIC_RESTART, LoadViewResponse } from 'constellation-common';
import { ws } from "../../communications/Websocket";
import { E26, showError } from "../../ErrorLogger";

export class LoadViewAction extends Action {

    private viewId: string;

    constructor(viewId: string) {
        super();

        this.viewId = viewId;
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('loadView', JSON.stringify({
                boardId: useStore().state.generalData.currentProjectBoard!.boardId,
                viewId: this.viewId,
            }));
        } else {
            // If local project, make the IPC request
            window.board.loadView({
                viewId: this.viewId,
            }).then((resp) => LoadViewAction.processResponse(resp));
        }
    }

    static processResponse(resp: LoadViewResponse): void {
        if ('errorCode' in resp) {
            showError(E26, [resp.message || GENERIC_RESTART]);
        } else {
            const store = useStore();
            store.dispatch('openView', resp.viewConfig);
        }
    }

}
