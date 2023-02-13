
import { Action } from "../Action";
import { BoardData } from '../../../../../common/DataTypes/BoardDataTypes';
import { useStore } from '../../store/store';
import { Block } from "../../../../../common/DataTypes/BlockDataTypes";
import { mapify } from "../../../common/ArrayUtils";

export class GetBoardDataAction extends Action {

    private boardId: string;

    constructor(boardId: string) {
        super();
        this.boardId = boardId;
    }

    getRequestData() {
        return {
            boardId: this.boardId
        }
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            // TODO-const : Send GetBoardData over websocket
        } else {
            // If local project, make the IPC request
            window.board.getBoardData(this.boardId)
                .then((boardData: BoardData | undefined) => this.processResponse(boardData));
        }
    }

    processResponse(data: BoardData | undefined): void {
        const store = useStore();

        if (data === undefined) {
            // TODO-const : post error to user
            console.error("Error fetching board data for board: " + this.boardId);
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
