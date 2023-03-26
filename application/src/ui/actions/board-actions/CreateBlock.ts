
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { BoundingBox } from "../../../../../common/DataTypes/GenericDataTypes";
import { useEmitter } from "../../composables/Emitter";
import { CreateBlockResponse, GENERIC_RESTART } from "../../../../../common/DataTypes/ActionDataTypes";
import { ws } from "../../communications/Websocket";
import { E14, showError } from "../../../common/ErrorLogger";

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
            ws.emit('createBlock', JSON.stringify({
                boardId: useStore().state.generalData.currentProjectBoard!.boardId,
                location: this.location,
                parentBlockId: this.parentBlockId
            }));
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

        if ('errorCode' in resp) {
                showError(E14, [resp.message || GENERIC_RESTART]);

        } else {
            const emitter = useEmitter();

            store.dispatch('addBlocks', [resp]);
            store.dispatch('createNode', { blockId: resp.id, parentId: resp.parentBlockId });

            // Begin editing the block (assumes we were the user that submitted this request)
            store.dispatch("selectBlock", {blockId: resp.id, clearCurrentSelection: true});
            store.dispatch("startEditingBlock", resp.id);
            emitter.emit('blockCreated', resp.id);
        }
    }

}
