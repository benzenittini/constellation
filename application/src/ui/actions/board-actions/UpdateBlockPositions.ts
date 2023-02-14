
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { BlockIdAndPosition } from "../../../../../common/DataTypes/BlockDataTypes";
import { BoundingBox } from "../../../../../common/DataTypes/GenericDataTypes";

export class UpdateBlockPositionsAction extends Action {

    private boardId: string;
    private blocksAndPositions: BlockIdAndPosition[];

    constructor(boardId: string) {
        super();
        this.boardId = boardId;
        this.blocksAndPositions = [];
    }

    addBlockAndPosition(blockId: string, location: BoundingBox) {
        this.blocksAndPositions.push({ blockId, location });
    }

    getRequestData() {
        return {
            boardId: this.boardId,
            blocksAndPositions: this.blocksAndPositions,
        }
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            // TODO-const : Send GetBoardData over websocket
            // Optimistically, assume it's going to work.
            this.processResponse(this.blocksAndPositions);
        } else {
            // If local project, make the IPC request
            window.board.updateBlockPositions(this.blocksAndPositions)
                .then((updatedBlockPositions: BlockIdAndPosition[]) => this.processResponse(updatedBlockPositions));
        }
    }

    processResponse(updatedBlockPositions: BlockIdAndPosition[]): void {
        useStore().dispatch('setBlockPositions', updatedBlockPositions);
    }

}
