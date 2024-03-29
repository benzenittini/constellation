
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { TypedMap, GENERIC_RESTART, SetFieldDefinitionsResponse, FieldDefinition, PossibleValueDefinition } from 'constellation-common/datatypes';
import { ws } from "../../communications/Websocket";
import { E21, showError } from "../../ErrorLogger";

export class SetFieldDefinitionsAction extends Action {

    private blockIds: string[];
    private fieldDefinitions: TypedMap<FieldDefinition>;
    private fieldIds: string[];
    private possibleValueDefinitions: TypedMap<PossibleValueDefinition>;
    private deletedFieldIds: string[];

    constructor(blockIds: string[], fieldDefinitions: TypedMap<FieldDefinition>, fieldIds: string[], possibleValueDefinitions: TypedMap<PossibleValueDefinition>, deletedFieldIds: string[]) {
        super();

        this.blockIds = blockIds;
        this.fieldDefinitions = fieldDefinitions;
        this.fieldIds = fieldIds;
        this.possibleValueDefinitions = possibleValueDefinitions;
        this.deletedFieldIds = deletedFieldIds;
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('setFieldDefinitions', JSON.stringify({
                boardId: useStore().state.generalData.currentProjectBoard!.boardId,
                blockIds: this.blockIds,
                fieldDefinitions: this.fieldDefinitions,
                fieldIds: this.fieldIds,
                possibleValueDefinitions: this.possibleValueDefinitions,
                deletedFieldIds: this.deletedFieldIds,
            }));
        } else {
            // If local project, make the IPC request
            window.board.setFieldDefinitions({
                blockIds: this.blockIds,
                fieldDefinitions: this.fieldDefinitions,
                fieldIds: this.fieldIds,
                possibleValueDefinitions: this.possibleValueDefinitions,
                deletedFieldIds: this.deletedFieldIds,
            }).then((resp) => SetFieldDefinitionsAction.processResponse(resp));
        }
    }

    static processResponse(resp: SetFieldDefinitionsResponse): void {
        if ('errorCode' in resp) {
            showError(E21, [resp.message || GENERIC_RESTART]);
        } else {
            const store = useStore();

            // Update the Field definitions
            store.dispatch('setPossibleValueDefinitions', resp.possibleValueDefinitions);
            store.dispatch('setFieldDefinitions',         resp.fieldDefinitions);

            // Update the Field IDs on the blocks
            for (let blockId in resp.blockFieldIds) {
                store.dispatch('setBlockFieldIds', { blockId: blockId, fieldIds: resp.blockFieldIds[blockId] });
            }

            // Update any fields that had their value set to a PV that changed names
            for (let changedFieldValue of resp.changedFieldValues) {
                store.dispatch('setBlockFieldValue', {
                    blockId: changedFieldValue.blockId,
                    fieldId: changedFieldValue.fieldId,
                    value: changedFieldValue.newValue,
                });
            }
        }
    }

}
