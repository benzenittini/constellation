
import { Action } from "../Action";
import { useStore } from '../../store/store';
import { BoundingBox, TypedMap } from "../../../../../common/DataTypes/GenericDataTypes";
import { useEmitter } from "../../composables/Emitter";
import { CreateBlockResponse, SetClassificationDefinitionsResponse } from "../../../../../common/DataTypes/ActionDataTypes";
import { ClassificationDefinition, FieldDefinition, PossibleValueDefinition } from "../../../../../common/DataTypes/FieldDataTypes";

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
            // TODO-const : Send action over websocket
        } else {
            // If local project, make the IPC request
            window.board.setClassificationDefinitions({
                classificationIds: this.classificationIds,
                classifications: this.classifications,
                fields: this.fields,
                possibleValues: this.possibleValues,
            }).then((resp) => this.processResponse(resp));
        }
    }

    processResponse(resp: SetClassificationDefinitionsResponse): void {
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
