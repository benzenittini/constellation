
import { useStore } from "../../store/store";
import { Action } from "../Action";

import { mapify } from '../../../common/ArrayUtils';
import { BasicBoardData, LOCAL_PROJECT } from "../../../../../common/DataTypes/BoardDataTypes";

export class GetBoardsForProjectAction extends Action {

    private projectId: string;

    constructor(projectId: string) {
        super();
        this.projectId = projectId;
    }

    getRequestData() {
        return {};
    }

    submit(): void {
        if (this.projectId !== LOCAL_PROJECT) {
            // If remote project, send message over websocket.
            // TODO-const : Send GetBoardsForProject over websocket
        } else {
            // If local project, make the IPC request
            window.project.getRecentBoards()
                .then((boards: BasicBoardData[]) => this.processResponse(boards));
        }
    }

    processResponse(boards: BasicBoardData[]): void {
        useStore().dispatch('setBoardsForProject', {
            projectId: this.projectId,
            boards: mapify<BasicBoardData>(boards, 'boardId'),
        });
    }

}
