
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { SetBlockPriorityResponse } from "../../../../../common/DataTypes/ActionDataTypes";

export class SetBlockPriorityAction extends Action {

    private blockId: string[];
    private beforeId: string | undefined; // "Undefined" indicates "end of list"

    constructor(blockId: string[], beforeId: string | undefined) {
        super();

        this.blockId = blockId;
        this.beforeId = beforeId;
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            // TODO-const : Send action over websocket
        } else {
            // If local project, make the IPC request
            window.board.setBlockPriority({
                blockId: this.blockId,
                beforeId: this.beforeId,
            }).then((resp) => this.processResponse(resp));
        }
    }

    processResponse(resp: SetBlockPriorityResponse): void {
        const store = useStore();

        store.dispatch("setBlockPriority", {blockId: resp.blockId, higherThan: resp.beforeId});
    }

}
