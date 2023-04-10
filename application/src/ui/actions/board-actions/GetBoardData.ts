
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { GENERIC_RESTART, GetBoardDataResponse } from 'constellation-common';
import { ws } from "../../communications/Websocket";
import { E13, showError } from "../../ErrorLogger";

export class GetBoardDataAction extends Action {

    private boardId: string;

    constructor() {
        super();
        this.boardId = useStore().state.generalData.currentProjectBoard!.boardId;
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('getBoardData', JSON.stringify({
                boardId: this.boardId,
            }));
        } else {
            // If local project, make the IPC request
            window.board.getBoardData({
                boardId: this.boardId
            }).then((boardData) => GetBoardDataAction.processResponse(boardData));
        }
    }

    static processResponse(resp: GetBoardDataResponse): void {
        const store = useStore();

        if ('errorCode' in resp) {
            store.dispatch('setCurrentProjectBoard', undefined);
            showError(E13, [resp.message || GENERIC_RESTART]);

        } else {
            // Field Definitions
            store.dispatch('setPossibleValueDefinitions',  resp.possibleValues);
            store.dispatch('setFieldDefinitions',          resp.fields);
            store.dispatch('setClassificationDefinitions', {
                classificationDefinitions: resp.classifications,
                classificationIds: resp.classificationIds
            });

            // Blocks
            store.dispatch('setBlocks', resp.blocks);
            store.dispatch('setBlockPriorities', resp.blockPriorities);

            // Hierarchy
            store.dispatch('clearHierarchy');
            for (let block of Object.values(resp.blocks)) {
                store.dispatch('createNode', { blockId: block.id, parentId: block.parentBlockId });
            }

            store.dispatch('setAvailableViews', resp.views);
        }

    }

}
