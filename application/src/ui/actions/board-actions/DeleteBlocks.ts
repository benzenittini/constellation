
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { DeleteBlocksResponse, GENERIC_RESTART } from 'constellation-common/datatypes';
import { ws } from "../../communications/Websocket";
import { E16, showError } from "../../ErrorLogger";

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
        if ('errorCode' in resp) {
            showError(E16, [resp.message || GENERIC_RESTART]);
        } else {
            useStore().dispatch('deleteBlocks', resp.blockIds);
        }
    }

}
