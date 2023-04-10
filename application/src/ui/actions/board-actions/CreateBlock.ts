
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { useEmitter } from "../../composables/Emitter";
import { BoundingBox, CreateBlockResponse, GENERIC_RESTART } from 'constellation-common/datatypes';
import { ws } from "../../communications/Websocket";
import { E14, showError } from "../../ErrorLogger";

export class CreateBlockAction extends Action {

    private location: BoundingBox;
    private parentBlockId: string | undefined;

    constructor(location: BoundingBox, parentBlockId: string | undefined = undefined) {
        super();

        this.location = location;
        this.parentBlockId = parentBlockId;
    }

    submit(): void {
        const store = useStore();
        const clientId = store.state.generalData.clientId;
        if (store.getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('createBlock', JSON.stringify({
                clientId: clientId,
                boardId: store.state.generalData.currentProjectBoard!.boardId,
                location: this.location,
                parentBlockId: this.parentBlockId
            }));
        } else {
            // If local project, make the IPC request
            window.board.createBlock({
                clientId: clientId,
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

            store.dispatch('addBlocks', [resp.block]);
            store.dispatch('createNode', { blockId: resp.block.id, parentId: resp.block.parentBlockId });

            // Begin editing the block if we're the client that submitted it.
            if (store.state.generalData.clientId === resp.clientId) {
                store.dispatch("selectBlock", {blockId: resp.block.id, clearCurrentSelection: true});
                store.dispatch("startEditingBlock", resp.block.id);
                emitter.emit('blockCreated', resp.block.id);
            }
        }
    }

}
