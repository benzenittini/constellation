
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { BasicBoardData, LOCAL_PROJECT } from "../../store/Types/GeneralDataTypes";

export class CreateNewBoardAction extends Action {

    private projectId: string;

    // *Only remote boards get a name. Local boards should be undefined!*
    private boardName?: string;

    constructor(projectId: string, boardName?: string) {
        super();
        this.projectId = projectId;
        this.boardName = boardName;
    }

    getRequestData() {
        return {
            boardName: this.boardName,
        };
    }

    submit(): void {
        if (this.projectId !== LOCAL_PROJECT) {
            // If remote project, send message over websocket.
            // TODO-const : Send GetBoardData over websocket
        } else {
            // If local project, make the IPC request
            window.project.createNewBoard()
                .then((boardData: BasicBoardData | undefined) => this.processResponse(boardData));
        }
    }

    processResponse(boardData: BasicBoardData | undefined): void {
        if (boardData) {
            useStore().dispatch('addBoardToProject', {
                projectId: this.projectId,
                boardData,
            });
        }
    }

}
