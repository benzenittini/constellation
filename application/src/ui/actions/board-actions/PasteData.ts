
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { CopyData, GENERIC_RESTART, PasteDataResponse } from 'constellation-common/datatypes';
import { ws } from "../../communications/Websocket";
import { E14, showError } from "../../ErrorLogger";

export class PasteDataAction extends Action {

    private pastedData: CopyData;

    constructor(pastedData: CopyData) {
        super();
        this.pastedData = pastedData;
    }

    submit(): void {
        const store = useStore();
        const clientId = store.state.generalData.clientId;
        if (store.getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('pasteData', JSON.stringify({
                clientId: clientId,
                boardId: store.state.generalData.currentProjectBoard!.boardId,
                pastedData: this.pastedData,
            }));
        } else {
            // If local project, make the IPC request
            window.board.pasteData({
                clientId: clientId,
                pastedData: this.pastedData,
            }).then((resp) => PasteDataAction.processResponse(resp));
        }
    }

    static processResponse(resp: PasteDataResponse): void {
        const store = useStore();

        if ('errorCode' in resp) {
            showError(E14, [resp.message || GENERIC_RESTART]);

        } else {
            const { blocks, classificationIds, classificationDefs, fieldDefs, possibleValueDefs } = resp;

            // Create the classifications, fields and possible values in the local store.
            store.dispatch('setClassificationDefinitions', { classificationDefinitions: classificationDefs, classificationIds });
            store.dispatch('setFieldDefinitions', fieldDefs);
            store.dispatch('setPossibleValueDefinitions', possibleValueDefs);

            // Create the blocks
            store.dispatch('addBlocks', blocks);
            for (const block of blocks) {
                store.dispatch('createNode', { blockId: block.id, parentId: block.parentBlockId });
            }

            // Auto-select all the blocks if we're the client that pasted them.
            if (store.state.generalData.clientId === resp.clientId) {
                store.dispatch("selectBlocks", {blockIds: blocks.map(b => b.id), clearCurrentSelection: true});
            }
        }
    }

}
