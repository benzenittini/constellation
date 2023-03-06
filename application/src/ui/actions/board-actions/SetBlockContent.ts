
import { Action } from "../Action";
import { useStore } from '../../store/store';

import { SetBlockContentResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { BlockContent } from "../../../../../common/DataTypes/BlockDataTypes";
import { ws } from "../../communications/Websocket";

export class SetBlockContentAction extends Action {

    private blockId: string;
    private content: BlockContent;

    constructor(blockId: string, content: BlockContent) {
        super();
        this.blockId = blockId;
        this.content = content;
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('setBlockContent', JSON.stringify({
                boardId: useStore().state.generalData.currentProjectBoard!.boardId,
                blockId: this.blockId,
                content: this.content,
            }));
        } else {
            // If local project, make the IPC request
            window.board.setBlockContent({
                blockId: this.blockId,
                content: this.content,
            }).then((resp) => SetBlockContentAction.processResponse(resp));
        }
    }

    static processResponse(resp: SetBlockContentResponse): void {
        useStore().dispatch("setBlockContent", {
            blockId: resp.blockId,
            newContent: resp.content,
        });
    }

}
