
import { Action } from "../Action";
import { BoardData } from '../../../../../common/DataTypes/BoardDataTypes';
import { useStore } from '../../store/store';

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
        if (data === undefined) {
            // TODO-const : post error
            console.log("Error fetching board data for board: " + this.boardId);
            return;
        }

        console.log("Received: " + JSON.stringify(data));

        // TODO-const : Persist the board data into Vuex

        // if (data.statusCode == 0) {
        //     let store = useStore();

        //     // Field Definitions
        //     store.dispatch('setPossibleValueDefinitions',  data.possibleValueDefinitions);
        //     store.dispatch('setFieldDefinitions',          data.fieldDefinitions);
        //     store.dispatch('setClassificationDefinitions', data.classificationsWithOrdering);

        //     // Entities
        //     let entityDTOs: { entity: Entity, parentEntityId: string }[] = GetBoardDataAction.parseEntities(data);
        //     store.dispatch('setEntities', entityDTOs.map(e => e.entity));
        //     store.dispatch('setBlockPriorities', data.blockPriorities);

        //     // Hierarchy
        //     store.dispatch('clearHierarchy');
        //     for (let entity of entityDTOs) {
        //         store.dispatch('createNode', { entityId: entity.entity.id, parentId: entity.parentEntityId });
        //     }

        //     store.dispatch('setAvailableViews', mapify((data.availableViews as BaseViewConfig[]), 'id'));

        // } else {
        //     ErrorLogger.showError('4.1.9', [data.errorMessage]);
        // }
    }

}
