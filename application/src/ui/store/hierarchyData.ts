
import { MutationTree, ActionTree, GetterTree, Module } from "vuex";
import { useVueNotify } from 'mw-vue-notify';

import { TypedMap } from "../../../../common/DataTypes/GenericDataTypes";
import { BlockLinkPair, RootState } from "./StoreTypes";
import { HierarchyDataState, HierarchyDataGetters, HierarchyDataMutations, HierarchyDataActions } from "./Types/HierarchyStoreTypes";


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
    deleteNode({ commit, state, dispatch },  blockId) {
        let node = state.hierarchy[blockId];
        let childIds = JSON.parse(JSON.stringify(node.childrenBlockIds)); // parse+stringify is to do a copy since we're modifying the underlying list
        let parentId = node.parentBlockId;
        for (let childId of childIds) {
            dispatch('setParent', { blockId: childId, newParent: parentId }); // FYI, parentId may be undefined
        }

        // Remove it as a child from its parent
        if (parentId) {
            commit('removeChild', { parentId, childId: blockId });
        }

        // Clean up the store
        commit('deleteNode', blockId);
    },
    setParent({ commit, state, getters, rootState }, { blockId, newParent }) { // TODO-later : newParent --> parentId
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
            // We need to update all impacted block sizes based on their new depth. For now, let's record their "old depths",
            // and then once we update their place in the hierarchy we can perform the update based on their "new depths".
            let descendants = getters.getTransitiveDescendants(blockId);
            let oldDepths: TypedMap<number> = {};
            for (let childId of descendants) {
                oldDepths[childId] = getters.blockScales[childId];
            }

            // Remove blockId as a child from it's current parent (if it has one)
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

            // Update all impacted block sizes based on their new depth
            for (let childId of descendants) {
                let parentId = (childId !== blockId) ? state.hierarchy[childId].parentBlockId! : newParent;
                let block = rootState.blockData.blocks[childId];
                let newDepth = parentId
                    ? (1.5 * getters.blockScales[parentId]) // x + 0.5x => 1.5x
                    : 1;
                let newWidth = block.location.width * oldDepths[childId] / newDepth;
                let newHeight = block.location.height * oldDepths[childId] / newDepth;
                commit('setBlockPosition', {
                    blockId: childId,
                    x: block.location.x,
                    y: block.location.y,
                    width: newWidth,
                    height: newHeight
                });
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