
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { BoundingBox } from "../../../../../common/DataTypes/GenericDataTypes";
import { useEmitter } from "../../composables/Emitter";
import { CreateBlockResponse } from "../../../../../common/DataTypes/ActionDataTypes";

export class CreateBlockAction extends Action {

    private location: BoundingBox;
    private parentBlockId: string | undefined;

    constructor(location: BoundingBox, parentBlockId: string | undefined = undefined) {
        super();

        this.location = location;
        this.parentBlockId = parentBlockId;
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            // TODO-const : Send GetBoardData over websocket
        } else {
            // If local project, make the IPC request
            window.board.createBlock({
                location: this.location,
                parentBlockId: this.parentBlockId
            }).then((resp) => CreateBlockAction.processResponse(resp));
        }
    }

    static processResponse(resp: CreateBlockResponse): void {
        const store = useStore();
        const emitter = useEmitter();

        if (resp === undefined) {
            // TODO-const : post error to user
            console.error("Error creating a new block");
            return;
        }

        // Since we verified it's a block.
        const newBlock = resp;

        store.dispatch('addBlocks', [newBlock]);
        store.dispatch('createNode', { blockId: newBlock.id, parentId: newBlock.parentBlockId });
        // Begin editing the block (assumes we were the user that submitted this request)
        store.dispatch("selectBlock", {blockId: newBlock.id, clearCurrentSelection: true});
        store.dispatch("startEditingBlock", newBlock.id);
        emitter.emit('blockCreated', newBlock.id);
    }

}
