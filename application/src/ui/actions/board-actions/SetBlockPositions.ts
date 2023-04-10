
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { BlockIdAndPosition, BoundingBox, GENERIC_RESTART, SetBlockPositionsResponse } from 'constellation-common';
import { ws } from "../../communications/Websocket";
import { E15, showError } from "../../ErrorLogger";

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
        // Optimistically, assume it's going to work. Otherwise, we get some really spazzy movements.
        SetBlockPositionsAction.processResponse(this.blocksAndPositions);

        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('setBlockPositions', JSON.stringify({
                boardId: useStore().state.generalData.currentProjectBoard!.boardId,
                blocksAndPositions: this.blocksAndPositions,
            }));
        } else {
            // If local project, make the IPC request
            window.board.setBlockPositions({
                blocksAndPositions: this.blocksAndPositions
            });
        }
    }

    static processResponse(resp: SetBlockPositionsResponse): void {
        if ('errorCode' in resp) {
            showError(E15, [resp.message || GENERIC_RESTART]);
        } else {
            useStore().dispatch('setBlockPositions', resp);
        }
    }

}
