
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { DeleteBlocksResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { ws } from "../../communications/Websocket";

export class DeleteBlocksAction extends Action {

    private blockIds: string[];

    constructor(blockIds: string[]) {
        super();
        this.blockIds = blockIds;
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('deleteBlocks', JSON.stringify({
                boardId: useStore().state.generalData.currentProjectBoard!.boardId,
                blockIds: this.blockIds,
            }));
        } else {
            // If local project, make the IPC request
            window.board.deleteBlocks({
                blockIds: this.blockIds
            }).then((resp) => DeleteBlocksAction.processResponse(resp));
        }
    }

    static processResponse(resp: DeleteBlocksResponse): void {
        useStore().dispatch('deleteBlocks', resp.blockIds);
    }

}
