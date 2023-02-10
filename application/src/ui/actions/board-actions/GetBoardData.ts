
import { BoardData } from '../../../common/BoardDataTypes';
import { BoardCommsSingleton } from '../../communications/BoardCommsSingleton';

import { Action } from "../Action";

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
        BoardCommsSingleton.activeInterface!
            .getBoardData(this.boardId)
            .then(boardData => this.processResponse(boardData));
    }

    processResponse(data: BoardData): void {
        console.log("Received: " + JSON.stringify(data));
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
