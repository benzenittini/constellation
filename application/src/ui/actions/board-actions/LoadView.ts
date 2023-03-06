
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { LoadViewResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { ws } from "../../communications/Websocket";

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
        const store = useStore();

        store.dispatch('openView', resp.viewConfig);
    }

}
