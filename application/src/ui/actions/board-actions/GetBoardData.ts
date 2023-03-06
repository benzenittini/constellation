
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { GetBoardDataResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { ws } from "../../communications/Websocket";

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

    static processResponse(data: GetBoardDataResponse): void {
        const store = useStore();

        if (data === undefined) {
            // TODO-const : post error to user
            console.error("Error fetching board data.");
            store.dispatch('setCurrentProjectBoard', undefined);
            return;
        }

        // Field Definitions
        store.dispatch('setPossibleValueDefinitions',  data.possibleValues);
        store.dispatch('setFieldDefinitions',          data.fields);
        store.dispatch('setClassificationDefinitions', {
            classificationDefinitions: data.classifications,
            classificationIds: data.classificationIds
        });

        // Blocks
        store.dispatch('setBlocks', data.blocks);
        store.dispatch('setBlockPriorities', data.blockPriorities);

        // Hierarchy
        store.dispatch('clearHierarchy');
        for (let block of Object.values(data.blocks)) {
            store.dispatch('createNode', { blockId: block.id, parentId: block.parentBlockId });
        }

        store.dispatch('setAvailableViews', data.views);
    }

}
