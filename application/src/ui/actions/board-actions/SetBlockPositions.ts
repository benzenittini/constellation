
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { BlockIdAndPosition } from "../../../../../common/DataTypes/BlockDataTypes";
import { BoundingBox } from "../../../../../common/DataTypes/GenericDataTypes";
import { SetBlockPositionsResponse } from "../../../../../common/DataTypes/ActionDataTypes";

export class SetBlockPositionsAction extends Action {

    private blocksAndPositions: BlockIdAndPosition[];

    constructor() {
        super();
        this.blocksAndPositions = [];
    }

    addBlockAndPosition(blockId: string, location: BoundingBox) {
        this.blocksAndPositions.push({ blockId, location });
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            // TODO-const : Send GetBoardData over websocket
            // Optimistically, assume it's going to work.
            this.processResponse(this.blocksAndPositions);
        } else {
            // If local project, make the IPC request
            window.board.setBlockPositions({
                blocksAndPositions: this.blocksAndPositions
            }).then((resp) => this.processResponse(resp));
        }
    }

    processResponse(resp: SetBlockPositionsResponse): void {
        useStore().dispatch('setBlockPositions', resp);
    }

}