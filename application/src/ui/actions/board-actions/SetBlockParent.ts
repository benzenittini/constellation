
import { Action } from "../Action";
import { useStore } from '../../store/store';

import { GENERIC_RESTART, SetBlockParentRequest, SetBlockParentResponse } from '../../../../../common/DataTypes/ActionDataTypes';
import { ws } from "../../communications/Websocket";
import { E17, showError } from "../../../common/ErrorLogger";

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
            ws.emit('setBlockParent', JSON.stringify({
                boardId: useStore().state.generalData.currentProjectBoard!.boardId,
                blockId: this.blockId,
                parentBlockId: this.parentBlockId,
            }));
        } else {
            // If local project, make the IPC request
            window.board.setBlockParent({
                blockId: this.blockId,
                parentBlockId: this.parentBlockId,
            }).then((resp) => SetBlockParentAction.processResponse(resp));
        }
    }

    static processResponse(resp: SetBlockParentResponse): void {
        if ('errorCode' in resp) {
            showError(E17, [resp.message || GENERIC_RESTART]);
        } else {
            useStore().dispatch("setParent", {
                blockId: resp.blockId,
                newParent: resp.parentBlockId, // FYI, data.parentBlockId may be undefined
            });
        }
    }

}
