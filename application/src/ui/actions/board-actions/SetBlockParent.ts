
import { Action } from "../Action";
import { useStore } from '../../store/store';

import { SetBlockParentRequest, SetBlockParentResponse } from '../../../../../common/DataTypes/ActionDataTypes';

export class SetBlockParentAction extends Action {

    private blockId: string;
    private parentBlockId: string | undefined;

    constructor(req: SetBlockParentRequest) {
        super();
        this.blockId = req.blockId;
        this.parentBlockId = req.parentBlockId;
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            // TODO-const : Send action over websocket
        } else {
            // If local project, make the IPC request
            window.board.setBlockParent({
                blockId: this.blockId,
                parentBlockId: this.parentBlockId,
            }).then((resp) => SetBlockParentAction.processResponse(resp));
        }
    }

    static processResponse(resp: SetBlockParentResponse): void {
        useStore().dispatch("setParent", {
            blockId: resp.blockId,
            newParent: resp.parentBlockId, // FYI, data.parentBlockId may be undefined
        });
    }

}
