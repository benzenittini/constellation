
import { MutationTree, ActionTree, GetterTree, Module } from "vuex";
import { HierarchyDataState, HierarchyDataGetters, HierarchyDataMutations, HierarchyDataActions } from "./Types/HierarchyDataTypes";
import { EntityLinkPair, RootState, TypedMap } from "./StoreTypes";

import { useVueNotify } from 'mw-vue-notify';


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
    createNewNode(state, entityId) {
        if (!state.hierarchy[entityId]) {
            state.hierarchy[entityId] = {
                parentEntityId: undefined,
                childrenEntityIds: []
            };
        }
    },
    deleteNode(state, entityId) {
        delete state.hierarchy[entityId];
    },

    // -- Parent Mutations --
    assignParent(state, {parentId, childId}) {
        state.hierarchy[childId].parentEntityId = parentId;
    },
    clearParent(state, childId) {
        state.hierarchy[childId].parentEntityId = undefined;
    },

    // -- Children Mutations --
    addChild(state, {parentId, childId}) {
        state.hierarchy[parentId].childrenEntityIds.push(childId);
    },
    removeChild(state, {parentId, childId}) {
        let childIndex = state.hierarchy[parentId].childrenEntityIds.indexOf(childId);
        if (childIndex !== -1) {
            state.hierarchy[parentId].childrenEntityIds.splice(childIndex, 1);
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

    createNode({ commit, state }, { entityId, parentId }) {
        // When you create a new node, it will _never_ have any children, and the parent is optional.
        commit('createNewNode', entityId);
        if (parentId) {
            commit('createNewNode', parentId); // If many nodes are created at once, sometimes the parent doesn't exist yet, which causes problems.
            commit('addChild',     { parentId, childId: entityId });
            commit('assignParent', { parentId, childId: entityId });
        }
    },
    deleteNode({ commit, state, dispatch },  entityId) {
        let node = state.hierarchy[entityId];
        let childIds = JSON.parse(JSON.stringify(node.childrenEntityIds)); // parse+stringify is to do a copy since we're modifying the underlying list
        let parentId = node.parentEntityId;
        for (let childId of childIds) {
            dispatch('setParent', { entityId: childId, newParent: parentId }); // FYI, parentId may be undefined
        }

        // Remove it as a child from its parent
        if (parentId) {
            commit('removeChild', { parentId, childId: entityId });
        }

        // Clean up the store
        commit('deleteNode', entityId);
    },
    setParent({ commit, state, getters, rootState }, { entityId, newParent }) { // TODO-later : newParent --> parentId
        // Verify we don't have a circular reference by traversing up the hierarchy
        let isCircular = false;
        let currentEntityId: string | undefined = newParent;
        while (currentEntityId !== undefined) {
            currentEntityId = state.hierarchy[currentEntityId].parentEntityId;
            // If we ever return to the original entity, then we're caught in a loop. Abandon ship!
            if (currentEntityId === entityId) {
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
            // We need to update all impacted entity sizes based on their new depth. For now, let's record their "old depths",
            // and then once we update their place in the hierarchy we can perform the update based on their "new depths".
            let descendants = getters.getTransitiveDescendants(entityId);
            let oldDepths: TypedMap<number> = {};
            for (let childId of descendants) {
                oldDepths[childId] = getters.entityScales[childId];
            }

            // Remove entityId as a child from it's current parent (if it has one)
            let currentParent = state.hierarchy[entityId].parentEntityId;
            if (currentParent) {
                commit('removeChild', { parentId: currentParent, childId: entityId });
            }

            // Add entityId as a child to the new parent
            if (newParent) {
                commit('addChild',     { parentId: newParent, childId: entityId });
                commit('assignParent', { parentId: newParent, childId: entityId });
            } else {
                commit('clearParent', entityId);
            }

            // Update all impacted entity sizes based on their new depth
            for (let childId of descendants) {
                let parentId = (childId !== entityId) ? state.hierarchy[childId].parentEntityId! : newParent;
                let entity = rootState.entityData.entities[childId];
                let newDepth = parentId
                    ? (1.5 * getters.entityScales[parentId]) // x + 0.5x => 1.5x
                    : 1;
                let newWidth = entity.location.width * oldDepths[childId] / newDepth;
                let newHeight = entity.location.height * oldDepths[childId] / newDepth;
                commit('setEntityPosition', {
                    entityId: childId,
                    x: entity.location.x,
                    y: entity.location.y,
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
        let pairs: EntityLinkPair[] = [];

        let visibleEntities = getters.visibleEntities;
        for (let entityId in visibleEntities) {
            let parentId = state.hierarchy[entityId].parentEntityId;

            // Parent must exist and be visible for this to be a visible link
            if (parentId && visibleEntities[parentId]) {
                let parentLocation = visibleEntities[parentId].location;
                let entityLocation = visibleEntities[entityId].location;

                pairs.push({
                    id: `${parentId}_${entityId}`,
                    source: {
                        entityId: parentId,
                        isSelected: visibleEntities[parentId].isSelected,
                        x: parentLocation.x + parentLocation.width/2,
                        y: parentLocation.y + parentLocation.height/2,
                        entityWidth: parentLocation.width,
                        entityHeight: parentLocation.height,
                    },
                    destination: {
                        entityId: entityId,
                        isSelected: visibleEntities[entityId].isSelected,
                        x: entityLocation.x + entityLocation.width/2,
                        y: entityLocation.y + entityLocation.height/2,
                        entityWidth: entityLocation.width,
                        entityHeight: entityLocation.height,
                    }
                });
            }
        }
        return pairs;
    },
    entityScales: (state) => {
        let scales: TypedMap<number> = {};
        for (let entityId in state.hierarchy) {
            let depth = 1; // "1" is a root-level entity. Bigger numbers are decendants
            let currentId = entityId;
            while (state.hierarchy[currentId].parentEntityId !== undefined) {
                depth += (depth * 0.5);
                currentId = <string> state.hierarchy[currentId].parentEntityId;
            }
            scales[entityId] = depth;
        }
        return scales;
    },
    getTopLevelBlocks: (state) => {
        let topLevel: string[] = [];
        for (let entityId in state.hierarchy) {
            if (state.hierarchy[entityId].parentEntityId === undefined) {
                topLevel.unshift(entityId);
            }
        }
        return topLevel;
    },
    getTransitiveDescendants: (state) => (parentEntityId: string) => {
        let descendantIds: string[] = [parentEntityId];
    
        for (let descendantId of descendantIds) {
            state.hierarchy[descendantId].childrenEntityIds.forEach(id => {
                descendantIds.push(id);
            });
        }
    
        return descendantIds;
    },
    getParentChain: (state) => (entityId: string) => {
        let chain: string[] = [];

        let currentNode = state.hierarchy[entityId]?.parentEntityId;
        while (currentNode !== undefined) {
            chain.unshift(currentNode);
            currentNode = state.hierarchy[currentNode].parentEntityId;
        }

        return chain;
    }
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