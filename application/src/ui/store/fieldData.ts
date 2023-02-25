
import { MutationTree, ActionTree, GetterTree, Module } from "vuex";
import { FieldDataState, FieldDataGetters, FieldDataMutations, FieldDataActions } from "./Types/FieldStoreTypes";
import { RootState } from "./StoreTypes";
import * as ErrorLogger from "../../common/ErrorLogger";
import { TypedMap } from "../../../../common/DataTypes/GenericDataTypes";
import { getFieldDataType } from "../../../../common/DataTypes/FieldDataTypes";


// =====
// State
// -----

const fieldDataState: FieldDataState = {
    classificationIds: [],
    classificationDefinitions: {},
    fieldDefinitions: {},
    possibleValueDefinitions: {},
}


// =========
// Mutations
// ---------

const fieldDataMutations: MutationTree<FieldDataState> & FieldDataMutations = {
    resetStore (state) {
        state.classificationIds = [];
        state.classificationDefinitions = {};
        state.fieldDefinitions = {};
        state.possibleValueDefinitions = {};
    },
    clearBoardState (state) {
        state.classificationIds = [];
        state.classificationDefinitions = {};
        state.fieldDefinitions = {};
        state.possibleValueDefinitions = {};
    },

    setClassifications (state, {classificationDefinitions, classificationIds}) {
        state.classificationIds = classificationIds;
        state.classificationDefinitions = classificationDefinitions;
    },

    setFields   (state, fields)  { state.fieldDefinitions = { ...state.fieldDefinitions, ...fields };    },
    addField    (state, field)   { state.fieldDefinitions[field.id] = field; },
    removeField (state, fieldId) { delete state.fieldDefinitions[fieldId]; },

    setPossibleValues   (state, possibleValues)  { state.possibleValueDefinitions = { ...state.possibleValueDefinitions, ...possibleValues };    },
    addPossibleValue    (state, possibleValue)   { state.possibleValueDefinitions[possibleValue.id] = possibleValue; },
    removePossibleValue (state, possibleValueId) { delete state.possibleValueDefinitions[possibleValueId]; },
}


// =======
// Actions
// -------

const fieldDataActions: ActionTree<FieldDataState, RootState> & FieldDataActions = {
    resetStore      ({ commit }) { commit('resetStore'); },
    clearBoardState ({ commit }) { commit('clearBoardState'); },

    setClassificationDefinitions ({ commit }, { classificationDefinitions, classificationIds }) {
        commit('setClassifications', { classificationDefinitions, classificationIds });
    },
    setFieldDefinitions          ({ commit }, fields)          { commit('setFields',          fields); },
    setPossibleValueDefinitions  ({ commit }, possibleValues)  { commit('setPossibleValues',  possibleValues); },
}


// =======
// Getters
// -------

const fieldDataGetters: GetterTree<FieldDataState, RootState> & FieldDataGetters = {
    classificationIds: (state) => { return state.classificationIds; },
    classifications:   (state) => { return state.classificationDefinitions; },
    fields:            (state) => { return state.fieldDefinitions; },
    possibleValues:    (state) => { return state.possibleValueDefinitions; },

    boardColors:   (state) => {
        let colors: Set<string> = new Set();
        Object.values(state.possibleValueDefinitions).forEach(pv => {
            if (pv.style) {
                Object.values(pv.style).forEach(value => {
                    if (typeof value === 'string')
                        colors.add(value);
                });
            }
        });
        return [...colors]; // [...converts Set to array]
    },

    getChangedFieldValues: (state, getters, rootState) => (newPVDefs) => {

        // Get a list of all PVs that have changed their name. Need these changes to update fields that have those values.
        let currentPVs = getters.possibleValues;
        let changedPVs: { pvId: string, oldName: string, newName: string }[] = [];
        for (let pvId of Object.keys(newPVDefs)) {
            if (currentPVs[pvId]?.name && currentPVs[pvId].name !== newPVDefs[pvId].name) {
                changedPVs.push({ pvId, oldName: currentPVs[pvId].name, newName: newPVDefs[pvId].name });
            }
        }

        let changedFieldValues: { blockId: string, fieldId: string, newValue: any }[] = [];
        // (special array logic goes here..?)
        for (let changedPV of changedPVs) {
            // Determine which field has this PV.
            // NOTE: This assumes PVs cannot be moved across fields, which was true at the time of writing.
            let fieldId = Object.values(getters.fields)
                .find(f => f.possibleValueIds.includes(changedPV.pvId))?.id;
            if (fieldId) {
                // Identify any blocks that have the "old value" for this field.
                for (let block of Object.values(rootState.blockData.blocks)) {
                    if (Array.isArray(block.fieldValues[fieldId])) {
                        let index = block.fieldValues[fieldId].indexOf(changedPV.oldName);
                        if (index !== -1) {
                            changedFieldValues.push({
                                blockId: block.id,
                                fieldId: fieldId,
                                newValue: block.fieldValues[fieldId]
                            });
                        }
                    } else if (block.fieldValues[fieldId] === changedPV.oldName) {
                        block.fieldValues[fieldId] = changedPV.newName;
                        changedFieldValues.push({
                            blockId: block.id,
                            fieldId: fieldId,
                            newValue: block.fieldValues[fieldId]
                        });
                    }
                }
            } else {
                // The possible value didn't have an associated field ... this shouldn't ever happen.
                ErrorLogger.showError('3.1.1');
            }
        }

        return changedFieldValues;
    },
    fieldIdToClassificationId: (state) => {
        return Object.values(state.classificationDefinitions)
            .reduce((lookup, classification) => {
                classification.fieldIds.forEach(fv => lookup[fv] = classification.id);
                return lookup;
            }, {} as TypedMap<string>);
    },
    classificationOptions: (state, getters) => {
        return Object.values(getters.classifications)
            .map(c => ({ value: c.id, display: c.name }));
    },
    classificationFieldPairOptions: (state, getters) => (filter) => {
        // Groups classifications/fields as an array of:
        // { value: '<field-id>', display: 'Classification > Field' }
        let fields = getters.fields;
        return Object.values(getters.classifications)
            .reduce((pairs, curr) => {
                pairs.push(...curr.fieldIds
                    .filter(f => filter ? filter(fields[f]) : true)
                    .map(fieldId => ({
                        value: fieldId,
                        display: `${curr.name} > ${fields[fieldId].name}`
                    })));
                return pairs;
            }, [] as { value: string, display: string }[]);
    },
    getPossibleValueOptsForField: (state, getters) => (fieldId) => {
        if (!fieldId) { return []; }
        let pvs = getters.possibleValues;
        return getters.fields[fieldId].possibleValueIds
            .map(pvid => ({
                value: pvid,
                display: pvs[pvid].name
            }));
    },

    getFieldTypeGivenFieldId: (state, getters) => (fieldId) => {
        if (!fieldId) { return null; }
        return getters.fields[fieldId].type;
    },
    getFieldDataTypeGivenFieldId: (state, getters) => (fieldId) => {
        if (!fieldId) { return null; }
        return getFieldDataType(getters.fields[fieldId].type);
    },
}


// =====
// Store
// -----

export const fieldDataStore: Module<FieldDataState, RootState> = {
    state: fieldDataState,
    getters: fieldDataGetters,
    mutations: fieldDataMutations,
    actions: fieldDataActions
}