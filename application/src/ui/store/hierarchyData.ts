
import { MutationTree, ActionTree, GetterTree, Module } from "vuex";
import { useVueNotify } from 'mw-vue-notify';

import { BoundingBox, TypedMap } from 'constellation-common/datatypes';
import { BlockLinkPair, RootState } from "./StoreTypes";
import { HierarchyDataState, HierarchyDataGetters, HierarchyDataMutations, HierarchyDataActions } from "./Types/HierarchyStoreTypes";
import { ScaleUtils } from "constellation-common/utilities";


// =====
// State
// -----

const hierarchyDataState: HierarchyDataState = {
    hierarchy: {}
}


// =========
// Mutations
// ---------

const hierarchyDataMutations: MutationTree<HierarchyDataState> & HierarchyDataMutations = {
    resetStore (state) {
        state.hierarchy = {};
    },
    clearBoardState (state) {
        state.hierarchy = {};
    },
    clearHierarchy (state) {
        state.hierarchy = {};
    },

    // -- Node Mutations --
    createNewNode(state, blockId) {
        if (!state.hierarchy[blockId]) {
            state.hierarchy[blockId] = {
                parentBlockId: undefined,
                childrenBlockIds: []
            };
        }
    },
    deleteNode(state, blockId) {
        delete state.hierarchy[blockId];
    },

    // -- Parent Mutations --
    assignParent(state, {parentId, childId}) {
        state.hierarchy[childId].parentBlockId = parentId;
    },
    clearParent(state, childId) {
        state.hierarchy[childId].parentBlockId = undefined;
    },

    // -- Children Mutations --
    addChild(state, {parentId, childId}) {
        state.hierarchy[parentId].childrenBlockIds.push(childId);
    },
    removeChild(state, {parentId, childId}) {
        let childIndex = state.hierarchy[parentId].childrenBlockIds.indexOf(childId);
        if (childIndex !== -1) {
            state.hierarchy[parentId].childrenBlockIds.splice(childIndex, 1);
        }
    },
}


// =======
// Actions
// -------

const hierarchyDataActions: ActionTree<HierarchyDataState, RootState> & HierarchyDataActions = {
    resetStore      ({ commit }) { commit('resetStore'); },
    clearBoardState ({ commit }) { commit('clearBoardState'); },
    clearHierarchy  ({ commit }) { commit('clearHierarchy'); },

    createNode({ commit, state }, { blockId, parentId }) {
        // When you create a new node, it will _never_ have any children, and the parent is optional.
        commit('createNewNode', blockId);
        if (parentId) {
            commit('createNewNode', parentId); // If many nodes are created at once, sometimes the parent doesn't exist yet, which causes problems.
            commit('addChild',     { parentId, childId: blockId });
            commit('assignParent', { parentId, childId: blockId });
        }
    },
    deleteNode({ commit, state, dispatch, rootState }, blockId) {
        const node = state.hierarchy[blockId];
        let childIds = JSON.parse(JSON.stringify(node.childrenBlockIds)) as string[]; // parse+stringify is to do a copy since we're modifying the underlying list
        let parentId = node.parentBlockId;

        // The "focal point" for this operation is "the child location closest to the deleted node"
        const nodeLoc = rootState.blockData.blocks[blockId].location;
        const focalPoint = childIds
            .map(id => rootState.blockData.blocks[id].location)
            .map(loc => ({
                location: loc,
                distance: Math.sqrt(
                    Math.pow(loc.x - nodeLoc.x, 2) +
                    Math.pow(loc.y - nodeLoc.y, 2)
                )
            }))
            .sort((a, b) => a.distance - b.distance)?.[0]?.location;
        for (let childId of childIds) {
            dispatch('setParent', { blockId: childId, newParent: parentId, focalPoint }); // FYI, parentId may be undefined
        }

        // Remove it as a child from its parent
        if (parentId) {
            commit('removeChild', { parentId, childId: blockId });
        }

        // Clean up the store
        commit('deleteNode', blockId);
    },
    setParent({ commit, state, getters, rootState, dispatch }, { blockId, newParent, focalPoint }) {
        // Verify we don't have a circular reference by traversing up the hierarchy
        let isCircular = false;
        let currentBlockId: string | undefined = newParent;
        while (currentBlockId !== undefined) {
            currentBlockId = state.hierarchy[currentBlockId].parentBlockId;
            // If we ever return to the original block, then we're caught in a loop. Abandon ship!
            if (currentBlockId === blockId) {
                isCircular = true;
                if (getters.inDemoMode) {
                    useVueNotify().showNotification({
                        cssClasses: ['mw-notification-warning'],
                        dismissAfterMillis: 4000,
                        data: { message: "Circular hierarchies are not allowed." }
                    });
                }
            }
        }

        if (!isCircular) {
            const blockLookup = rootState.blockData.blocks;
            const originalBlockDepth = ScaleUtils.getDepth(blockLookup[blockId], blockLookup);
            const parentBlockDepth = newParent ? ScaleUtils.getDepth(blockLookup[newParent], blockLookup) : 0;

            // Remove blockId as a child from its current parent (if it has one)
            let currentParent = state.hierarchy[blockId].parentBlockId;
            if (currentParent) {
                commit('removeChild', { parentId: currentParent, childId: blockId });
            }

            // Add blockId as a child to the new parent
            if (newParent) {
                commit('addChild',     { parentId: newParent, childId: blockId });
                commit('assignParent', { parentId: newParent, childId: blockId });
            } else {
                commit('clearParent', blockId);
            }
            // Updates the blockData too.
            dispatch('setBlockParent', { parentId: newParent, childId: blockId });


            // Update all impacted block locations.
            // -- Children are rescaled --
            const oldChildLocation = JSON.parse(JSON.stringify(blockLookup[blockId].location));
            const newChildLocation = ScaleUtils.updateBounds(blockLookup[blockId].location, originalBlockDepth, parentBlockDepth+1, focalPoint);
            commit('setBlockPosition', { blockId, ...newChildLocation });
            // -- Grandchildren are rescaled and repositioned --
            for (const gchildId of getters.getTransitiveDescendants(blockId)) {
                // Skip the child (since it was already taken care of)
                if (gchildId === blockId) continue;
                // Update the grandchildren
                const depthFromChild = ScaleUtils.getDepth(blockLookup[gchildId], blockLookup, blockId);
                const origLoc = blockLookup[gchildId].location;
                const newGchildLocation = ScaleUtils.updateBounds(
                    {
                        // Need to shift the original position based on how much this block's parent moved, as the parent
                        //   may have moved as a result of one of its siblings rescaling.
                        x: origLoc.x + (newChildLocation.x - oldChildLocation.x),
                        y: origLoc.y + (newChildLocation.y - oldChildLocation.y),
                        width: origLoc.width,
                        height: origLoc.height,
                    },
                    originalBlockDepth + depthFromChild,
                    parentBlockDepth + 1 + depthFromChild,
                    newChildLocation,
                );
                commit('setBlockPosition', { blockId: gchildId, ...newGchildLocation });
            }
        }
    },
}


// =======
// Getters
// -------

const hierarchyDataGetters: GetterTree<HierarchyDataState, RootState> & HierarchyDataGetters = {
    visibleHierarchyLinkPairs: (state, getters) => {
        let pairs: BlockLinkPair[] = [];

        let visibleBlocks = getters.visibleBlocks;
        for (let blockId in visibleBlocks) {
            let parentId = state.hierarchy[blockId].parentBlockId;

            // Parent must exist and be visible for this to be a visible link
            if (parentId && visibleBlocks[parentId]) {
                let parentLocation = visibleBlocks[parentId].location;
                let blockLocation = visibleBlocks[blockId].location;

                pairs.push({
                    id: `${parentId}_${blockId}`,
                    source: {
                        blockId: parentId,
                        isSelected: visibleBlocks[parentId].isSelected || false,
                        x: parentLocation.x + parentLocation.width/2,
                        y: parentLocation.y + parentLocation.height/2,
                        blockWidth: parentLocation.width,
                        blockHeight: parentLocation.height,
                    },
                    destination: {
                        blockId: blockId,
                        isSelected: visibleBlocks[blockId].isSelected || false,
                        x: blockLocation.x + blockLocation.width/2,
                        y: blockLocation.y + blockLocation.height/2,
                        blockWidth: blockLocation.width,
                        blockHeight: blockLocation.height,
                    }
                });
            }
        }
        return pairs;
    },
    blockScales: (state) => {
        // TODO-ben: Scale : REMOVE THIS in favor of utilities..?
        let scales: TypedMap<number> = {};
        for (let blockId in state.hierarchy) {
            let depth = 1; // "1" is a root-level block. Bigger numbers are decendants
            let currentId = blockId;
            while (state.hierarchy[currentId].parentBlockId !== undefined) {
                depth += (depth * 0.5);
                currentId = <string> state.hierarchy[currentId].parentBlockId;
            }
            scales[blockId] = depth;
        }
        return scales;
    },
    getTopLevelBlocks: (state) => {
        let topLevel: string[] = [];
        for (let blockId in state.hierarchy) {
            if (state.hierarchy[blockId].parentBlockId === undefined) {
                topLevel.unshift(blockId);
            }
        }
        return topLevel;
    },
    getTransitiveDescendants: (state) => (parentBlockId: string) => {
        let descendantIds: string[] = [parentBlockId];
    
        for (let descendantId of descendantIds) {
            state.hierarchy[descendantId].childrenBlockIds.forEach(id => {
                descendantIds.push(id);
            });
        }
    
        return descendantIds;
    },
    getParentChain: (state) => (blockId: string) => {
        let chain: string[] = [];

        let currentNode = state.hierarchy[blockId]?.parentBlockId;
        while (currentNode !== undefined) {
            chain.unshift(currentNode);
            currentNode = state.hierarchy[currentNode].parentBlockId;
        }

        return chain;
    },
    getSiblings: (state, getters) => (blockId: string) => {
        let parentId = state.hierarchy[blockId].parentBlockId;
        if (parentId !== undefined) {
            return [...state.hierarchy[parentId].childrenBlockIds];
        } else {
            return [...getters.getTopLevelBlocks];
        }
    },
}


// =====
// Store
// -----

export const hierarchyDataStore: Module<HierarchyDataState, RootState> = {
    state: hierarchyDataState,
    getters: hierarchyDataGetters,
    mutations: hierarchyDataMutations,
    actions: hierarchyDataActions
}