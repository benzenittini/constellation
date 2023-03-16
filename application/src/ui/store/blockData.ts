
import { MutationTree, ActionTree, GetterTree, Module } from "vuex";

import { RootState } from "./StoreTypes";
import { BlockDataState, BlockDataGetters, BlockDataMutations, BlockDataActions } from "./Types/BlockStoreTypes";

import * as ErrorLogger from "../../common/ErrorLogger";
import * as RectangleUtils from '../../../../common/utilities/RectangleUtils';
import * as ObjectUtils from '../../../../common/utilities/ObjectUtils';
import { GRAY8 } from '../styles/styleVariables';
import { TypedMap } from "../../../../common/DataTypes/GenericDataTypes";
import { MIN_BLOCK_HEIGHT, MIN_BLOCK_WIDTH, SearchResult } from "../../../../common/DataTypes/BlockDataTypes";
import { getFieldValue } from "../../../../common/DataTypes/FieldDataTypes";


// =====
// State
// -----

const blockDataState: BlockDataState = {
    blocks: {},
    blockPriorities: [],
    expandedBlockIds: [],
    blockIdBeingEdited: undefined,
}


// =========
// Mutations
// ---------

const blockDataMutations: MutationTree<BlockDataState> & BlockDataMutations = {
    resetStore (state) {
        state.blocks = {};
        state.blockPriorities = [];
        state.expandedBlockIds = [];
        state.blockIdBeingEdited = undefined;
    },
    clearBoardState (state) {
        state.blocks = {};
        state.blockPriorities = [];
        state.expandedBlockIds = [];
        state.blockIdBeingEdited = undefined;
    },

    addBlocks (state, blocks) {
        for (let block of blocks) {
            state.blocks[block.id] = block;
        }
    },
    setBlocks (state, blocks) {
        state.blocks = blocks;
    },
    selectBlocks(state, blockIds) {
        for (let blockId of blockIds) {
            if (state.blocks[blockId]) {
                state.blocks[blockId].isSelected = true;
            }
        }
    },
    deselectAllBlocks(state) {
        Object.keys(state.blocks).forEach(key => state.blocks[key].isSelected = false);
    },
    changeEditedBlock(state, blockId) {
        state.blockIdBeingEdited = blockId;
    },
    expandBlock(state, blockId) {
        let index = state.expandedBlockIds.indexOf(blockId);
        if (index === -1)
            state.expandedBlockIds.push(blockId);
    },
    contractBlock(state, blockId) {
        let index = state.expandedBlockIds.indexOf(blockId);
        if (index !== -1)
            state.expandedBlockIds.splice(index, 1);
    },

    lockOpenClosed(state, {blockIds, isLockedOpen}) {
        for (let blockId of blockIds) {
            state.blocks[blockId].isLockedOpen = isLockedOpen;
        }
    },

    setBlockPosition(state, {blockId, x, y, width, height}) {
        state.blocks[blockId].location.x = x;
        state.blocks[blockId].location.y = y;
        state.blocks[blockId].location.width = width;
        state.blocks[blockId].location.height = height;
    },
    deleteBlocks(state, {blockIds}) {
        for (let blockId of blockIds) {
            delete state.blocks[blockId];
        }
    },
    setBlockContent(state, {blockId, newContent}) {
        state.blocks[blockId].content = newContent;
    },
    setBlockClassificationId(state, {blockId, classificationId, isActive}) {
        let currentIndex = state.blocks[blockId].classificationIds.indexOf(classificationId);
        if (isActive && currentIndex === -1) {
            // Should be active, but isn't currently present. Add it.
            state.blocks[blockId].classificationIds.push(classificationId);
        } else if (!isActive && currentIndex !== -1) {
            // Shouldn't be active, but is currently present. Remove it.
            state.blocks[blockId].classificationIds.splice(currentIndex, 1);
        }
    },
    setBlockFieldIds(state, {blockId, fieldIds}) {
        state.blocks[blockId].fieldIds = fieldIds;
    },
    setBlockFieldValue(state, {blockId, fieldId, value}) {
        state.blocks[blockId].fieldValues[fieldId] = value;
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
                // TODO-const : Replace with correct error code.
                // ErrorLogger.showError('3.2.1');
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

const blockDataActions: ActionTree<BlockDataState, RootState> & BlockDataActions = {
    resetStore      ({ commit }) { commit('resetStore'); },
    clearBoardState ({ commit }) { commit('clearBoardState'); },

    // TODO (later) - should "logout" also reset the store..? (Hint: yes) Other store types need this too. It does reset already in generalStore

    addBlocks   ({ commit }, blocks) {
        commit('addBlocks', blocks);
        commit('insertBefore', { blockId: blocks.map(e => e.id), before: undefined });
    },
    setBlocks   ({ commit }, blocks) { commit('setBlocks', blocks); },

    // -- Block Selection --
    selectBlock  ({ commit }, {blockId, clearCurrentSelection = true}) {
        if (clearCurrentSelection) {
            commit('deselectAllBlocks');
        }
        commit('selectBlocks', [blockId]);
    },
    selectBlocks ({ commit }, {blockIds, clearCurrentSelection = true}) {
        if (clearCurrentSelection) {
            commit('deselectAllBlocks');
        }
        commit('selectBlocks', blockIds);
    },
    selectBlocksByBoundingBox ({ state, dispatch }, {boundingBox, clearCurrentSelection}) {
        let blockIds: string[] = [];
        Object.keys(state.blocks).forEach((key) => {
            let blockLocation = state.blocks[key].location;
            // Determine if the bounding box overlaps this block.
            // If it does, then add it to our blockIds array.
            if (rangesOverlap(blockLocation.x, blockLocation.width, boundingBox.x, boundingBox.width)
                && rangesOverlap(blockLocation.y, blockLocation.height, boundingBox.y, boundingBox.height)) {
                    blockIds.push(key);
            }
        });

        dispatch("selectBlocks", {blockIds, clearCurrentSelection});
    },
    clearBlockSelection ({ commit })           { commit('deselectAllBlocks'); },
    startEditingBlock   ({ commit }, blockId) { commit('changeEditedBlock', blockId); },
    stopEditingBlock    ({ commit })           { commit('changeEditedBlock', undefined); },

    lockOpenClosed  ({ commit, state }, {blockIds}) {
        // If all blocks are open, close them. Otherwise, open them.
        let shouldLockOpen = !blockIds.every(eid => state.blocks[eid].isLockedOpen);
        commit('lockOpenClosed', {blockIds, isLockedOpen: shouldLockOpen});
    },

    expandBlock   ({ commit }, blockId) { commit('expandBlock', blockId); },
    contractBlock ({ commit }, blockId) { commit('contractBlock', blockId); },

    // -- Block Manipulation --
    setBlockPositions   ({ commit }, blockIdsAndPositions) {
        for (let idAndPosition of blockIdsAndPositions) {
            commit('setBlockPosition', {
                blockId: idAndPosition.blockId,
                x: idAndPosition.location.x,
                y: idAndPosition.location.y,
                width: idAndPosition.location.width,
                height: idAndPosition.location.height,
            })
        }
    },

    // -- Block Deletion --
    deleteBlocks ({ commit, dispatch }, blockIds: string[]) {
        // Unassign all immedate children of these blocks.
        for (let blockId of blockIds) {
            dispatch('deleteNode', blockId)
        }

        // Lastly, delete these blocks.
        commit('deleteBlocks', { blockIds });
        // ...and their priorities
        for (let blockId of blockIds) {
            commit('deleteEntry', blockId);
        }
    },

    // -- Block Data --
    setBlockContent ({ commit }, { blockId, newContent }) {
        commit('setBlockContent', { blockId, newContent });
    },

    // -- Block Fields --
    setBlockClassificationId ({ commit, state }, { blockId, classificationId, isActive }) {
        commit('setBlockClassificationId', { blockId, classificationId, isActive });
    },
    setBlockFieldIds ({ commit, state, rootState }, { blockId, fieldIds }) {
        commit('setBlockFieldIds', { blockId, fieldIds });
    },
    setBlockFieldValue ({ commit, state, rootState }, { blockId, fieldId, value }) {
        commit('setBlockFieldValue', { blockId, fieldId, value });
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

const blockDataGetters: GetterTree<BlockDataState, RootState> & BlockDataGetters = {
    visibleBlocks: (state) => {
        return state.blocks;
    },
    selectedBlocks: (state) => {
        return Object.values(state.blocks)
            .filter(e => e.isSelected);
    },
    selectedBlockIds: (state) => {
        return Object.values(state.blocks)
            .filter(e => e.isSelected)
            .map(e => e.id);
    },
    expandedBlockIds: (state) => {
        return state.expandedBlockIds;
    },
    blockPriorities: (state) => {
        return state.blockPriorities;
    },

    blockSearch: (state, getters) => (criteria) => {
        if ('searchTerm' in criteria) {
            // -- Basic Search --
            return Object.values(state.blocks)
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
                }).reduce((results, block, index) => {
                    results.unshift({
                        breadcrumbs: getters.getParentChain(block.id).map(id => state.blocks[id].content.data.text),
                        summaryText: block.content.data.text,
                        blockId: block.id,
                        block: block,
                    })
                    return results;
                }, [] as SearchResult[]);
        } else {
            // Should never come up ... but in case it does, this should be pretty safe handling.
            return [];
        }
    },
    blockAtCoordinates: (state, getters) => (coordinates) => {
        return Object.values(state.blocks)
            .find(e => RectangleUtils.rectangleContainsPoint(e.location, coordinates));
    },

    // Returns all fieldIds (grouped by classificationId) that every provided block has.
    activeClassificationFieldIds: (state, getters) => (blockIds) => {
        if (blockIds.length == 0) return {};

        let blocks = Object.values(state.blocks).filter(e => blockIds.includes(e.id));

        // Reduce down to only the classifications that ALL blocks share (the "super-mega-ultra-intersection")
        let classificationIds = blocks
            .map(e => e.classificationIds)
            // Keep only the classifications that ALL selected blocks have
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
    // Returns all fieldIds that every provided block has defined DIRECTLY on it (ie, no classification fields).
    activeBlockFieldIds: (state, getters) => (blockIds) => {
        if (blockIds.length == 0) return [];

        return Object.values(state.blocks)
            // Keep only the blocks we're interested in
            .filter(e => blockIds.includes(e.id))
            // Map each block down to an array of its fieldIds
            .map(e => e.fieldIds)
            // Reduce down to only the fields that ALL blocks share (the "super-mega-ultra-intersection")
            .reduce((prev, curr) => prev.filter(id => curr.includes(id)));
    },
    activeFieldValueCounts: (state, getters) => (blockIds) => {
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

        let blocks = Object.values(state.blocks).filter(e => blockIds.includes(e.id));
        let classificationFieldIds = blocks
            // Map to arrays of classification IDs
            .map(e => e.classificationIds)
            // Keep only the classifications that ALL selected blocks have
            .reduce((prev, curr) => prev.filter(id => curr.includes(id)))
            // Keep only the classifications that still exist
            .filter(cid => getters.classificationIds.includes(cid))
            // Get the fieldIds for those classifications
            .map(cid => getters.classifications[cid].fieldIds)
            // Merge into one super-array
            .reduce((prev, curr) => [...prev, ...curr], []);

        for (let block of blocks) {
            for (let fieldId of [...classificationFieldIds, ...block.fieldIds]) {
                let fieldValue = getFieldValue(getters.fields[fieldId].type, block.fieldValues[fieldId]);

                if (returnValue[fieldId] === undefined)
                    returnValue[fieldId] = {
                        pvCounts: {},
                        outOf: blockIds.length
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
    },

    getStyles: (state, getters) => (block, depth) => {
        let style: any = {};

        let classificationIds = getters.classificationIds;
        let classificationDefs = getters.classifications;
        let fieldDefs = getters.fields;
        let pvDefs = getters.possibleValues;

        let applyStylesByFieldId = (fieldId: string) => {
            // Look up and apply the styles for the PVs that match this block's field value(s).
            // Since checkboxes can have multiple values chosen, need to find ALL the PVs that match.
            let rawValue: any = getFieldValue(fieldDefs[fieldId].type, block.fieldValues[fieldId]);
            let fieldValues: any[] = Array.isArray(rawValue) ? rawValue : [rawValue];
            fieldDefs[fieldId].possibleValueIds
                // Convert this field's pvIds to pvDefs
                .map(pvId => pvDefs[pvId])
                // Keep only the ones this block has a value for
                .filter(pv => fieldValues.includes(pv.name))
                // Merge their styles.
                .forEach(pvDef => {
                    if (pvDef?.style?.background) style['fill']   = pvDef.style.background;
                    if (pvDef?.style?.border)     style['stroke'] = pvDef.style.border;
                    if (pvDef?.style?.text)       style['color']  = pvDef.style.text;
                });
        }

        // Populate styles from the classifications
        classificationIds
            .filter(cid => block.classificationIds.includes(cid))
            .forEach(cid => {
                classificationDefs[cid]
                    // Keep only the fields that are defined on this block
                    .fieldIds?.filter((fid) => block.fieldValues[fid])
                    // Apply styles
                    .forEach(fid => applyStylesByFieldId(fid));
            });

        // Populate styles from the fields
        block.fieldIds
            // Keep only the ones defined directly on the block. (not the classifications - that's handled above.)
            .filter(fid => fieldDefs[fid].sourceType === 'block')
            // Apply styles
            .forEach(fid => applyStylesByFieldId(fid));

        // Populate any final style overrides that are important
        if (block.isSelected) {
            style.filter = `drop-shadow(0 0 ${10/depth}px ${GRAY8})`
        }
        style.strokeWidth = 3 / depth;

        return style;
    },
    getCssStyles: (state, getters) => (block, depth) => {
        let svgStyle = getters.getStyles(block, depth);
        let retVal: any = {};
        if (svgStyle.fill)   retVal.background = svgStyle.fill;
        if (svgStyle.stroke) retVal.border = svgStyle.strokeWidth + 'px solid ' + svgStyle.stroke;
        if (svgStyle.color)  retVal.color = svgStyle.color;
        return retVal;
    },
}


// =====
// Store
// -----

export const blockDataStore: Module<BlockDataState, RootState> = {
    state: blockDataState,
    getters: blockDataGetters,
    mutations: blockDataMutations,
    actions: blockDataActions
}


// ================
// Helper Functions
// ----------------

function rangesOverlap(x1: number, width1: number, x2: number, width2: number): boolean {
    let start1 = x1;
    let stop1 = x1 + width1;
    let start2 = x2;
    let stop2 = x2 + width2;

    if (start1 < start2 && start2 < stop1)
        return true;

    if (start2 < start1 && start1 < stop2)
        return true;

    return false;
}