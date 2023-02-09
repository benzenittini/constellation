
import { MutationTree, ActionTree, GetterTree, Module } from "vuex";

import { RootState, TypedMap } from "./StoreTypes";
import { EntityDataState, EntityDataGetters, EntityDataMutations, EntityDataActions, Entity, MIN_ENTITY_WIDTH, MIN_ENTITY_HEIGHT, SearchResult } from "./Types/EntityDataTypes";

import * as ErrorLogger from "../utilities/ErrorLogger";
import * as RectangleUtils from '../utilities/RectangleUtils';
import * as ObjectUtils from '../utilities/ObjectUtils';
import { getFieldValue } from "./Types/FieldDataTypes";


// =====
// State
// -----

const entityDataState: EntityDataState = {
    entities: {},
    blockPriorities: [],
    expandedEntityIds: [],
    entityIdBeingEdited: undefined,
}


// =========
// Mutations
// ---------

const entityDataMutations: MutationTree<EntityDataState> & EntityDataMutations = {
    resetStore (state) {
        state.entities = {};
        state.blockPriorities = [];
        state.expandedEntityIds = [];
        state.entityIdBeingEdited = undefined;
    },
    clearBoardState (state) {
        state.entities = {};
        state.blockPriorities = [];
        state.expandedEntityIds = [];
        state.entityIdBeingEdited = undefined;
    },

    addEntities (state, entities) {
        for (let entity of entities) {
            state.entities[entity.id] = entity;
        }
    },
    setEntities (state, entities) {
        state.entities = {};
        for (let entity of entities) {
            state.entities[entity.id] = entity;
        }
    },
    selectEntities(state, entityIds) {
        for (let entityId of entityIds) {
            if (state.entities[entityId]) {
                state.entities[entityId].isSelected = true;
            }
        }
    },
    deselectAllEntities(state) {
        Object.keys(state.entities).forEach(key => state.entities[key].isSelected = false);
    },
    changeEditedEntity(state, entityId) {
        state.entityIdBeingEdited = entityId;
    },
    expandEntity(state, entityId) {
        let index = state.expandedEntityIds.indexOf(entityId);
        if (index === -1)
            state.expandedEntityIds.push(entityId);
    },
    contractEntity(state, entityId) {
        let index = state.expandedEntityIds.indexOf(entityId);
        if (index !== -1)
            state.expandedEntityIds.splice(index, 1);
    },

    lockOpenClosed(state, {entityIds, isLockedOpen}) {
        for (let entityId of entityIds) {
            state.entities[entityId].isLockedOpen = isLockedOpen;
        }
    },

    moveEntitiesByDelta(state, {entityIds, deltaX, deltaY}) {
        for (let entityId of entityIds) {
            state.entities[entityId].location.x += deltaX;
            state.entities[entityId].location.y += deltaY;
        }
    },
    resizeEntitiesByDelta(state, {entityIds, entityScales, deltaX, deltaY}) {
        for (let entityId of entityIds) {
            let normalized = RectangleUtils.normalize(
                state.entities[entityId].location.x,
                state.entities[entityId].location.y,
                state.entities[entityId].location.width + deltaX,
                state.entities[entityId].location.height + deltaY);

            normalized.width = Math.max(normalized.width, MIN_ENTITY_WIDTH / entityScales[entityId]);
            normalized.height = Math.max(normalized.height, MIN_ENTITY_HEIGHT / entityScales[entityId]);

            state.entities[entityId].location.x = normalized.x;
            state.entities[entityId].location.y = normalized.y;
            state.entities[entityId].location.width = normalized.width;
            state.entities[entityId].location.height = normalized.height;
        }
    },
    setEntityPosition(state, {entityId, x, y, width, height}) {
        state.entities[entityId].location.x = x;
        state.entities[entityId].location.y = y;
        state.entities[entityId].location.width = width;
        state.entities[entityId].location.height = height;
    },
    deleteEntities(state, {entityIds}) {
        for (let entityId of entityIds) {
            delete state.entities[entityId];
        }
    },
    setEntityContent(state, {entityId, newContent}) {
        state.entities[entityId].content = newContent;
    },
    setEntityClassificationId(state, {entityId, classificationId, isActive}) {
        let currentIndex = state.entities[entityId].classificationIds.indexOf(classificationId);
        if (isActive && currentIndex === -1) {
            // Should be active, but isn't currently present. Add it.
            state.entities[entityId].classificationIds.push(classificationId);
        } else if (!isActive && currentIndex !== -1) {
            // Shouldn't be active, but is currently present. Remove it.
            state.entities[entityId].classificationIds.splice(currentIndex, 1);
        }
    },
    setEntityFieldIds(state, {entityId, fieldIds}) {
        state.entities[entityId].fieldIds = fieldIds;
    },
    setEntityFieldValue(state, {entityId, fieldId, value}) {
        state.entities[entityId].fieldValues[fieldId] = value;
    },

    // Block Priorities
    setBlockPriorities(state, priorities) {
        state.blockPriorities = priorities;
    },
    insertBefore(state, {blockId, before}) {
        if (before !== undefined) {
            let index = state.blockPriorities.indexOf(before);
            if (index !== -1) {
                state.blockPriorities.splice(index, 0, ...blockId);
            } else {
                // The "before" block wasn't found ... this shouldn't ever happen.
                ErrorLogger.showError('3.2.1');
            }
        } else {
            // If undefined, then insert at the end of the priority list.
            state.blockPriorities.push(...blockId);
        }
    },
    deleteEntry(state, blockId) {
        let index = state.blockPriorities.indexOf(blockId);
        if (index !== -1) {
            state.blockPriorities.splice(index, 1);
        }
    },
}


// =======
// Actions
// -------

const entityDataActions: ActionTree<EntityDataState, RootState> & EntityDataActions = {
    resetStore      ({ commit }) { commit('resetStore'); },
    clearBoardState ({ commit }) { commit('clearBoardState'); },

    // TODO (later) - should "logout" also reset the store..? (Hint: yes) Other store types need this too. It does reset already in generalStore

    addEntities   ({ commit }, entities) {
        commit('addEntities', entities);
        commit('insertBefore', { blockId: entities.map(e => e.id), before: undefined });
    },
    setEntities   ({ commit }, entities) { commit('setEntities', entities); },

    // -- Entity Selection --
    selectEntity  ({ commit }, {entityId, clearCurrentSelection = true}) {
        if (clearCurrentSelection) {
            commit('deselectAllEntities');
        }
        commit('selectEntities', [entityId]);
    },
    selectEntities ({ commit }, {entityIds, clearCurrentSelection = true}) {
        if (clearCurrentSelection) {
            commit('deselectAllEntities');
        }
        commit('selectEntities', entityIds);
    },
    clearEntitySelection ({ commit })           { commit('deselectAllEntities'); },
    startEditingEntity   ({ commit }, entityId) { commit('changeEditedEntity', entityId); },
    stopEditingEntity    ({ commit })           { commit('changeEditedEntity', undefined); },

    lockOpenClosed  ({ commit, state }, {entityIds}) {
        // If all blocks are open, close them. Otherwise, open them.
        let shouldLockOpen = !entityIds.every(eid => state.entities[eid].isLockedOpen);
        commit('lockOpenClosed', {entityIds, isLockedOpen: shouldLockOpen});
    },

    expandEntity   ({ commit }, entityId) { commit('expandEntity', entityId); },
    contractEntity ({ commit }, entityId) { commit('contractEntity', entityId); },

    // -- Entity Manipulation --
    dragSelectedEntities ({ commit, getters }, {deltaX, deltaY}) {
        commit('moveEntitiesByDelta', { entityIds: getters.selectedEntityIds, deltaX, deltaY});
    },
    resizeSelectedEntities ({ commit, getters }, {deltaX, deltaY}) {
        commit('resizeEntitiesByDelta', { entityIds: getters.selectedEntityIds, entityScales: getters.entityScales, deltaX, deltaY});
    },
    setEntityPositions   ({ commit }, entityIdsAndPositions) {
        for (let idAndPosition of entityIdsAndPositions) {
            commit('setEntityPosition', {
                entityId: idAndPosition.entityId,
                x: idAndPosition.location.x,
                y: idAndPosition.location.y,
                width: idAndPosition.location.width,
                height: idAndPosition.location.height,
            })
        }
    },

    // -- Entity Deletion --
    deleteEntities ({ commit, dispatch }, entityIds: string[]) {
        // Then, unassign all immedate children of these entities.
        for (let entityId of entityIds) {
            dispatch('deleteNode', entityId)
        }

        // Lastly, delete these entities.
        commit('deleteEntities', { entityIds });
        // ...and their priorities
        for (let entityId of entityIds) {
            commit('deleteEntry', entityId);
        }
    },
    deleteSelectedEntities ({ commit, dispatch, getters }) {
        dispatch('deleteEntities', getters.selectedEntityIds);
    },

    // -- Entity Data --
    setEntityContent ({ commit }, { entityId, newContent }) {
        commit('setEntityContent', { entityId, newContent });
    },

    // -- Entity Fields --
    setEntityClassificationId ({ commit, state }, { entityId, classificationId, isActive }) {
        commit('setEntityClassificationId', { entityId, classificationId, isActive });
    },
    setEntityFieldIds ({ commit, state, rootState }, { entityId, fieldIds }) {
        commit('setEntityFieldIds', { entityId, fieldIds });
    },
    setEntityFieldValue ({ commit, state, rootState }, { entityId, fieldId, value }) {
        commit('setEntityFieldValue', { entityId, fieldId, value });
    },

    // -- Block Priorities --
    setBlockPriorities({ commit, state }, priorities) {
        commit('setBlockPriorities', priorities);
    },
    setBlockPriority({ commit, state, getters }, {blockId, higherThan}) {
        for (let bid of blockId) {
            commit('deleteEntry', bid); // No-op if not found in the list.
        }
        commit('insertBefore', {blockId, before: higherThan});
    },
    removeBlockPriority({ commit, state }, blockId) {
        commit('deleteEntry', blockId);
    },
}


// =======
// Getters
// -------

const entityDataGetters: GetterTree<EntityDataState, RootState> & EntityDataGetters = {
    visibleEntities: (state) => {
        return state.entities;
    },
    selectedEntities: (state) => {
        return Object.values(state.entities)
            .filter(e => e.isSelected);
    },
    selectedEntityIds: (state) => {
        return Object.values(state.entities)
            .filter(e => e.isSelected)
            .map(e => e.id);
    },
    expandedEntityIds: (state) => {
        return state.expandedEntityIds;
    },
    blockPriorities: (state) => {
        return state.blockPriorities;
    },

    entitySearch: (state, getters) => (criteria) => {
        if ('searchTerm' in criteria) {
            // -- Basic Search --
            return Object.values(state.entities)
                .filter(e => {
                    // Only search fields for blocks that have the associated classification active (if the field has a classification).
                    let activeFieldValues: any[] = [];
                    for (let fieldId in e.fieldValues) {
                        let classificationId = getters.fieldIdToClassificationId[fieldId]
                        if (!classificationId || e.classificationIds.includes(classificationId)) {
                            activeFieldValues.push(e.fieldValues[fieldId]);
                        }
                    }
                    // Summary text
                    return e.content.data.text.toLowerCase().includes(criteria.searchTerm.toLowerCase())
                    // Any field values
                    || JSON.stringify(activeFieldValues).toLowerCase().includes(criteria.searchTerm.toLowerCase())
                }).reduce((results, entity, index) => {
                    results.unshift({
                        breadcrumbs: getters.getParentChain(entity.id).map(id => state.entities[id].content.data.text),
                        summaryText: entity.content.data.text,
                        entityId: entity.id,
                        block: entity,
                    })
                    return results;
                }, [] as SearchResult[]);
        } else {
            // Should never come up ... but in case it does, this should be pretty safe handling.
            return [];
        }
    },

    // Returns all fieldIds (grouped by classificationId) that every provided entity has.
    activeClassificationFieldIds: (state, getters) => (entityIds) => {
        if (entityIds.length == 0) return {};

        let entities = Object.values(state.entities).filter(e => entityIds.includes(e.id));

        // Reduce down to only the classifications that ALL entities share (the "super-mega-ultra-intersection")
        let classificationIds = entities
            .map(e => e.classificationIds)
            // Keep only the classifications that ALL selected entities have
            .reduce((prev, curr) => prev.filter(id => curr.includes(id)))
            // Keep only the classifications that still exist
            .filter(cid => getters.classificationIds.includes(cid));

        // Look up the fields for each classification
        let returnValue: TypedMap<string[]> = {};
        for (let classId of classificationIds) {
            returnValue[classId] = getters.classifications[classId].fieldIds || [];
        }

        return returnValue;
    },
    // Returns all fieldIds that every provided entity has defined DIRECTLY on it (ie, no classification fields).
    activeEntityFieldIds: (state, getters) => (entityIds) => {
        if (entityIds.length == 0) return [];

        return Object.values(state.entities)
            // Keep only the entities we're interested in
            .filter(e => entityIds.includes(e.id))
            // Map each entity down to an array of its fieldIds
            .map(e => e.fieldIds)
            // Reduce down to only the fields that ALL entities share (the "super-mega-ultra-intersection")
            .reduce((prev, curr) => prev.filter(id => curr.includes(id)));
    },
    activeFieldValueCounts: (state, getters) => (entityIds) => {
        // Returns something like this:
        // {
        //     'field-id': { pvCounts: { 'val1': 3, 'val2': 8 }, outOf: 10 },
        //     'field-id': { pvCounts: { null  : 3, 'val1': 8 }, outOf: 10 },
        //     'field-id': { pvCounts: { 'val1': 10           }, outOf: 10 },
        // }
        // * Arrays for checkboxes get flattened out into individual values.
        // * Objects (like date/time) get their date and/or time flattened to a single string key: "<date> <time>"
        //
        // NOTE: It's possible not all of these fields are displayed (ie, if they're from an
        //       unselected classification).
        let returnValue: TypedMap<{pvCounts: TypedMap<number>, outOf: number}> = {};

        let entities = Object.values(state.entities).filter(e => entityIds.includes(e.id));
        let classificationFieldIds = entities
            // Map to arrays of classification IDs
            .map(e => e.classificationIds)
            // Keep only the classifications that ALL selected entities have
            .reduce((prev, curr) => prev.filter(id => curr.includes(id)))
            // Keep only the classifications that still exist
            .filter(cid => getters.classificationIds.includes(cid))
            // Get the fieldIds for those classifications
            .map(cid => getters.classifications[cid].fieldIds)
            // Merge into one super-array
            .reduce((prev, curr) => [...prev, ...curr], []);

        for (let entity of entities) {
            for (let fieldId of [...classificationFieldIds, ...entity.fieldIds]) {
                let fieldValue = getFieldValue(getters.fields[fieldId].type, entity.fieldValues[fieldId]);

                if (returnValue[fieldId] === undefined)
                    returnValue[fieldId] = {
                        pvCounts: {},
                        outOf: entityIds.length
                    };

                if (Array.isArray(fieldValue)) {
                    // Checkbox fields can have multiple values selected, so it uses an array. Need to flatten the array.
                    for (let oneValue of fieldValue) {
                        returnValue[fieldId].pvCounts[oneValue] = (returnValue[fieldId].pvCounts[oneValue] || 0) + 1;
                    }
                } else if (ObjectUtils.isObjectWithKeys(fieldValue, ['date', 'time'])) {
                    let flattened = `${fieldValue.date} ${fieldValue.time}`;
                    returnValue[fieldId].pvCounts[flattened] = (returnValue[fieldId].pvCounts[flattened] || 0) + 1;
                } else {
                    returnValue[fieldId].pvCounts[fieldValue] = (returnValue[fieldId].pvCounts[fieldValue] || 0) + 1;
                }
            }
        }

        return returnValue;
    }
}


// =====
// Store
// -----

export const entityDataStore: Module<EntityDataState, RootState> = {
    state: entityDataState,
    getters: entityDataGetters,
    mutations: entityDataMutations,
    actions: entityDataActions
}