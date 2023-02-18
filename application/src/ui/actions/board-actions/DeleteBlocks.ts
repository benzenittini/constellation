
import { Action } from "../Action";
import { useStore } from '../../store/store';

export class DeleteBlocksAction extends Action {

    private boardId: string;
    private blockIds: string[];

    constructor(boardId: string, blockIds: string[]) {
        super();
        this.boardId = boardId;
        this.blockIds = blockIds;
    }

    getRequestData() {
        return {
            boardId: this.boardId,
            blockIds: this.blockIds,
        };
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            // TODO-const : Send GetBoardData over websocket
        } else {
            // If local project, make the IPC request
            window.board.deleteBlocks(this.blockIds)
                .then((deletedBlockIds: string[]) => this.processResponse(deletedBlockIds));
        }
    }

    processResponse(deletedBlockIds: string[]): void {
        useStore().dispatch('deleteBlocks', deletedBlockIds);
    }

}
