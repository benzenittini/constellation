
import { useStore } from "../../store/store";
import { Action } from "../Action";

import { mapify } from '../../../../../common/utilities/ArrayUtils';
import { BasicBoardData, LOCAL_PROJECT } from "../../../../../common/DataTypes/BoardDataTypes";
import { GetBoardsForProjectResponse } from "../../../../../common/DataTypes/ActionDataTypes";

export class GetBoardsForProjectAction extends Action {

    private projectId: string;

    constructor(projectId: string) {
        super();
        this.projectId = projectId;
    }

    submit(): void {
        if (this.projectId !== LOCAL_PROJECT) {
            // If remote project, send message over REST.
            // TODO-const : Send action over REST
        } else {
            // If local project, make the IPC request
            window.config.getRecentBoards()
                .then((boards) => this.processResponse(boards));
        }
    }

    processResponse(boards: GetBoardsForProjectResponse): void {
        useStore().dispatch('setBoardsForProject', {
            projectId: this.projectId,
            boards: mapify<BasicBoardData>(boards, 'boardId'),
        });
    }

}
