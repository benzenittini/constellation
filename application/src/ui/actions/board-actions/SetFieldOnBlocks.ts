
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { TypedMap } from "../../../../../common/DataTypes/GenericDataTypes";
import { GENERIC_RESTART, SetFieldOnBlocksResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { ws } from "../../communications/Websocket";
import { E22, showError } from "../../../common/ErrorLogger";

export class SetFieldOnBlocksAction extends Action {

    private fieldId: string;
    private blockIdToFieldValue: TypedMap<any>;

    constructor(fieldId: string, blockIdToFieldValue: TypedMap<any>) {
        super();

        this.fieldId = fieldId;
        this.blockIdToFieldValue = blockIdToFieldValue;
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('setFieldOnBlocks', JSON.stringify({
                boardId: useStore().state.generalData.currentProjectBoard!.boardId,
                fieldId: this.fieldId,
                blockIdToFieldValue: this.blockIdToFieldValue,
            }));
        } else {
            // If local project, make the IPC request
            window.board.setFieldOnBlocks({
                fieldId: this.fieldId,
                blockIdToFieldValue: this.blockIdToFieldValue,
            }).then((resp) => SetFieldOnBlocksAction.processResponse(resp));
        }
    }

    static processResponse(resp: SetFieldOnBlocksResponse): void {
        if ('errorCode' in resp) {
            showError(E22, [resp.message || GENERIC_RESTART]);
        } else {
            const store = useStore();

            for (let blockId in resp.blockIdToFieldValue) {
                store.dispatch('setBlockFieldValue', {
                    blockId,
                    fieldId: resp.fieldId,
                    value: resp.blockIdToFieldValue[blockId],
                });
            }
        }
    }

}
