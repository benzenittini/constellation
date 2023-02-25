
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { LoadViewResponse } from "../../../../../common/DataTypes/ActionDataTypes";

export class LoadViewAction extends Action {

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
            window.board.loadView({
                viewId: this.viewId,
            }).then((resp) => this.processResponse(resp));
        }
    }

    processResponse(resp: LoadViewResponse): void {
        const store = useStore();

        store.dispatch('openView', resp.viewConfig);
    }

}
