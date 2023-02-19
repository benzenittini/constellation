
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { LOCAL_PROJECT } from "../../../../../common/DataTypes/BoardDataTypes";
import { CreateNewBoardResponse } from "../../../../../common/DataTypes/ActionDataTypes";

export class CreateNewBoardAction extends Action {

    private projectId: string;

    // *Only remote boards get a name. Local boards should be undefined!*
    private boardName?: string;

    constructor(projectId: string, boardName?: string) {
        super();
        this.projectId = projectId;
        this.boardName = boardName;
    }

    submit(): void {
        if (this.projectId !== LOCAL_PROJECT) {
            // If remote project, send message over REST.
            // TODO-const : Send action over REST
        } else {
            // If local project, make the IPC request
            window.project.createNewBoard()
                .then((resp) => this.processResponse(resp));
        }
    }

    processResponse(boardData: CreateNewBoardResponse): void {
        if (boardData) {
            useStore().dispatch('addBoardToProject', {
                projectId: this.projectId,
                boardData,
            });
        }
    }

}
