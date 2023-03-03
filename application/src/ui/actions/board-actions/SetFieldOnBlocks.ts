
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { TypedMap } from "../../../../../common/DataTypes/GenericDataTypes";
import { SetFieldOnBlocksResponse } from "../../../../../common/DataTypes/ActionDataTypes";

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
            // TODO-const : Send action over websocket
        } else {
            // If local project, make the IPC request
            window.board.setFieldOnBlocks({
                fieldId: this.fieldId,
                blockIdToFieldValue: this.blockIdToFieldValue,
            }).then((resp) => SetFieldOnBlocksAction.processResponse(resp));
        }
    }

    static processResponse(resp: SetFieldOnBlocksResponse): void {
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
