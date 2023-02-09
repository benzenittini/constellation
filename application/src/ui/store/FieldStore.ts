
import { computed } from 'vue';

import { useStore } from './store';
import { Store } from './StoreTypes';
import { FieldDefinition, getFieldDataType } from './Types/FieldDataTypes';

function classificationIds(store: Store) {
    return computed(() => store.getters.classificationIds);
}
function classifications(store: Store) {
    return computed(() => store.getters.classifications);
}
function fields(store: Store) {
    return computed(() => store.getters.fields);
}
function possibleValues(store: Store) {
    return computed(() => store.getters.possibleValues);
}

function classificationOptions(store: Store) {
    return computed(() =>
        Object.values(store.getters.classifications)
            .map(c => ({ value: c.id, display: c.name })));
}
function classificationFieldPairOptions(store: Store, filter?: (f: FieldDefinition) => boolean) {
    // Groups classifications/fields as an array of:
    // { value: '<field-id>', display: 'Classification > Field' }
    return computed(() => {
        let fields = store.getters.fields;
        return Object.values(store.getters.classifications)
            .reduce((pairs, curr) => {
                pairs.push(...curr.fieldIds
                    .filter(f => filter ? filter(fields[f]) : true)
                    .map(fieldId => ({
                        value: fieldId,
                        display: `${curr.name} > ${fields[fieldId].name}`
                    })));
                return pairs;
            }, [] as { value: string, display: string }[]);
    });
}

function getFieldTypeGivenFieldId(store: Store, fieldId: string) {
    if (!fieldId) { return null; }
    return store.getters.fields[fieldId].type;
}

function getFieldDataTypeGivenFieldId(store: Store, fieldId: string) {
    if (!fieldId) { return null; }
    return getFieldDataType(store.getters.fields[fieldId].type);
}

function getPossibleValueOptsForField(store: Store, fieldId: string) {
    if (!fieldId) { return []; }
    let pvs = store.getters.possibleValues;
    return store.getters.fields[fieldId].possibleValueIds
        .map(pvid => ({
            value: pvid,
            display: pvs[pvid].name
        }));
}

function boardColors(store: Store) {
    return computed(() => store.getters.boardColors);
}

export function useFieldStore() {
    let store = useStore();

    return {
        rawState: store.state.classificationData,

        classificationIds:     () => classificationIds(store),
        classifications:       () => classifications(store),
        fields:                () => fields(store),
        possibleValues:        () => possibleValues(store),

        classificationOptions:          () => classificationOptions(store),
        classificationFieldPairOptions: (filter?: (f: FieldDefinition) => boolean) => classificationFieldPairOptions(store, filter),
        getFieldTypeGivenFieldId:       (fieldId: string) => getFieldTypeGivenFieldId(store, fieldId),
        getFieldDataTypeGivenFieldId:   (fieldId: string) => getFieldDataTypeGivenFieldId(store, fieldId),
        getPossibleValueOptsForField:   (fieldId: string) => getPossibleValueOptsForField(store, fieldId),

        boardColors: () => boardColors(store),
    }
}