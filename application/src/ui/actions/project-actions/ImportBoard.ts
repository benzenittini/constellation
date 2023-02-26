
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { LOCAL_PROJECT } from "../../../../../common/DataTypes/BoardDataTypes";
import { ImportBoardResponse } from "../../../../../common/DataTypes/ActionDataTypes";

export class ImportBoardAction extends Action {

    private projectId: string;

    constructor(projectId: string) {
        super();
        this.projectId = projectId;
    }

    submit(): void {
        if (this.projectId === LOCAL_PROJECT) {
            // If local project, make the IPC request. (Remote projects you can't import a board into from the UI.)
            window.project.importBoard()
                .then((resp) => this.processResponse(resp));
        }
    }

    processResponse(boardData: ImportBoardResponse): void {
        if (boardData) {
            useStore().dispatch('addBoardToProject', {
                projectId: this.projectId,
                boardData,
            });
        }
    }

}
