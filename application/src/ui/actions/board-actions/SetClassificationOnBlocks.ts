

import { Action } from "../Action";
import { useStore } from '../../store/store';
import { SetClassificationOnBlocksResponse } from "../../../../../common/DataTypes/ActionDataTypes";

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
            // TODO-const : Send GetBoardData over websocket
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
