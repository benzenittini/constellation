
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { TypedMap, GENERIC_RESTART, SetClassificationDefinitionsResponse, ClassificationDefinition, FieldDefinition, PossibleValueDefinition } from 'constellation-common/datatypes';
import { ws } from "../../communications/Websocket";
import { E19, showError } from "../../ErrorLogger";

export class SetClassificationDefinitionsAction extends Action {

    private classificationIds: string[];
    private classifications: TypedMap<ClassificationDefinition>;
    private fields: TypedMap<FieldDefinition>;
    private possibleValues: TypedMap<PossibleValueDefinition>;

    constructor(classificationIds: string[], classifications: TypedMap<ClassificationDefinition>, fields: TypedMap<FieldDefinition>, possibleValues: TypedMap<PossibleValueDefinition>) {
        super();

        this.classificationIds = classificationIds;
        this.classifications = classifications;
        this.fields = fields;
        this.possibleValues = possibleValues;
    }

    submit(): void {
        if (useStore().getters.isCurrentBoardRemote) {
            // If remote project, send message over websocket.
            ws.emit('setClassificationDefinitions', JSON.stringify({
                boardId: useStore().state.generalData.currentProjectBoard!.boardId,
                classificationIds: this.classificationIds,
                classifications: this.classifications,
                fields: this.fields,
                possibleValues: this.possibleValues,
            }));
        } else {
            // If local project, make the IPC request
            window.board.setClassificationDefinitions({
                classificationIds: this.classificationIds,
                classifications: this.classifications,
                fields: this.fields,
                possibleValues: this.possibleValues,
            }).then((resp) => SetClassificationDefinitionsAction.processResponse(resp));
        }
    }

    static processResponse(resp: SetClassificationDefinitionsResponse): void {
        if ('errorCode' in resp) {
            showError(E19, [resp.message || GENERIC_RESTART]);
        } else {
            const store = useStore();

            // Update the Field definitions
            store.dispatch('setPossibleValueDefinitions',  resp.possibleValues);
            store.dispatch('setFieldDefinitions',          resp.fields);
            store.dispatch('setClassificationDefinitions', {
                classificationDefinitions: resp.classifications,
                classificationIds: resp.classificationIds
            });

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
