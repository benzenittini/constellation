
import { Action } from "../Action";
import { BoardData } from '../../../../../common/DataTypes/BoardDataTypes';
import { useStore } from '../../store/store';
import { Block } from "../../../../../common/DataTypes/BlockDataTypes";
import { mapify } from "../../../common/ArrayUtils";
import { BoundingBox } from "../../../../../common/DataTypes/GenericDataTypes";
import { useEmitter } from "../../composables/Emitter";

export class CreateBlockAction extends Action {

    private boardId: string;
    private location: BoundingBox;
    private parentBlockId: string | undefined;

    constructor(boardId: string, location: BoundingBox, parentBlockId: string | undefined = undefined) {
        super();

        this.boardId = boardId;
        this.location = location;
        this.parentBlockId = parentBlockId;
    }

    getRequestData() {
        return {
            boardId: this.boardId,
            location: this.location,
            parentBlockId: this.parentBlockId,
        };
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            // TODO-const : Send GetBoardData over websocket
        } else {
            // If local project, make the IPC request
            window.board.createBlock(this.location, this.parentBlockId)
                .then((newBlock: Block | undefined) => this.processResponse(newBlock));
        }
    }

    processResponse(newBlock: Block | undefined): void {
        const store = useStore();
        const emitter = useEmitter();

        if (newBlock === undefined) {
            // TODO-const : post error to user
            console.error("Error creating a new block: " + JSON.stringify(this.getRequestData()));
            return;
        }

        store.dispatch('addBlocks', [newBlock]);
        store.dispatch('createNode', { blockId: newBlock.id, parentId: newBlock.parentBlockId });
        // Begin editing the block (assumes we were the user that submitted this request)
        store.dispatch("selectBlock", {blockId: newBlock.id, clearCurrentSelection: true});
        store.dispatch("startEditingBlock", newBlock.id);
        emitter.emit('blockCreated', newBlock.id);
    }

}
