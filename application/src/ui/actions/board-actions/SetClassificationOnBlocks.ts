

import { Action } from "../Action";
import { useStore } from '../../store/store';
import { GENERIC_RESTART, SetClassificationOnBlocksResponse } from 'constellation-common/datatypes';
import { ws } from "../../communications/Websocket";
import { E20, showError } from "../../ErrorLogger";

export class SetClassificationOnBlocksAction extends Action {

    private blockIds: string[];
    private classificationId: string;
    private isActive: boolean;

    constructor(blockIds: string[], classificationId: string, isActive: boolean) {
        super();

        this.blockIds = blockIds;
        this.classificationId = classificationId;
        this.isActive  = isActive;
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('setClassificationOnBlocks', JSON.stringify({
                boardId: useStore().state.generalData.currentProjectBoard!.boardId,
                blockIds: this.blockIds,
                classificationId: this.classificationId,
                isActive: this.isActive,
            }));
        } else {
            // If local project, make the IPC request
            window.board.setClassificationOnBlocks({
                blockIds: this.blockIds,
                classificationId: this.classificationId,
                isActive: this.isActive,
            }).then((resp) => SetClassificationOnBlocksAction.processResponse(resp));
        }
    }

    static processResponse(resp: SetClassificationOnBlocksResponse): void {
        if ('errorCode' in resp) {
            showError(E20, [resp.message || GENERIC_RESTART]);
        } else {
            const store = useStore();

            for (let blockId of resp.blockIds) {
                store.dispatch('setBlockClassificationId', {
                    blockId: blockId,
                    classificationId: resp.classificationId,
                    isActive: resp.isActive
                });
            }
        }
    }

}
