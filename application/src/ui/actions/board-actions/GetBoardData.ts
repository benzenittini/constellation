
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
        const store = useStore();

        if (data === undefined) {
            // TODO-const : post error to user
            console.error("Error fetching board data for board: " + this.boardId);
            store.dispatch('setCurrentProjectBoard', undefined);
            return;
        }

        console.log("Received: " + JSON.stringify(data));


        // // Field Definitions
        // store.dispatch('setPossibleValueDefinitions',  data.possibleValueDefinitions);
        // store.dispatch('setFieldDefinitions',          data.fieldDefinitions);
        // store.dispatch('setClassificationDefinitions', data.classificationsWithOrdering);

        // // Entities
        // let entityDTOs: { entity: Entity, parentEntityId: string }[] = GetBoardDataAction.parseEntities(data);
        // store.dispatch('setEntities', entityDTOs.map(e => e.entity));
        // store.dispatch('setBlockPriorities', data.blockPriorities);

        // // Hierarchy
        // store.dispatch('clearHierarchy');
        // for (let entity of entityDTOs) {
        //     store.dispatch('createNode', { entityId: entity.entity.id, parentId: entity.parentEntityId });
        // }

        // store.dispatch('setAvailableViews', mapify((data.availableViews as BaseViewConfig[]), 'id'));
    }

}
