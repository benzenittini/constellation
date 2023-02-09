
import { MutationTree, ActionTree, GetterTree, Module } from "vuex";
import { FieldDataState, FieldDataGetters, FieldDataMutations, FieldDataActions } from "./Types/FieldDataTypes";
import { RootState, TypedMap } from "./StoreTypes";
import * as ErrorLogger from "../utilities/ErrorLogger";


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

        let changedFieldValues: { entityId: string, fieldId: string, newValue: any }[] = [];
        // (special array logic goes here..?)
        for (let changedPV of changedPVs) {
            // Determine which field has this PV.
            // NOTE: This assumes PVs cannot be moved across fields, which was true at the time of writing.
            let fieldId = Object.values(getters.fields)
                .find(f => f.possibleValueIds.includes(changedPV.pvId))?.id;
            if (fieldId) {
                // Identify any entities that have the "old value" for this field.
                for (let entity of Object.values(rootState.entityData.entities)) {
                    if (Array.isArray(entity.fieldValues[fieldId])) {
                        let index = entity.fieldValues[fieldId].indexOf(changedPV.oldName);
                        if (index !== -1) {
                            changedFieldValues.push({
                                entityId: entity.id,
                                fieldId: fieldId,
                                newValue: entity.fieldValues[fieldId]
                            });
                        }
                    } else if (entity.fieldValues[fieldId] === changedPV.oldName) {
                        entity.fieldValues[fieldId] = changedPV.newName;
                        changedFieldValues.push({
                            entityId: entity.id,
                            fieldId: fieldId,
                            newValue: entity.fieldValues[fieldId]
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