
import { Action } from "../Action";
import { useStore } from '../../store/store';

import { BlockContent, GENERIC_RESTART, SetBlockContentResponse } from 'constellation-common/datatypes';
import { ws } from "../../communications/Websocket";
import { E18, showError } from "../../ErrorLogger";

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
        if ('errorCode' in resp) {
            showError(E18, [resp.message || GENERIC_RESTART]);
        } else {
            useStore().dispatch("setBlockContent", {
                blockId: resp.blockId,
                newContent: resp.content,
            });
        }
    }

}
