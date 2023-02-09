
import { computed } from 'vue';

import { useStore } from './store';
import { Store } from './StoreTypes';

// =======
// Getters
// -------

function visibleLinkPairs(store: Store) {
    return computed(() => store.getters.visibleHierarchyLinkPairs);
}
function entityScales(store: Store) {
    return computed(() => store.getters.entityScales);
}
function getSiblings(store: Store, blockId: string): string[] {
    let parentId = store.state.hierarchyData.hierarchy[blockId].parentEntityId;
    if (parentId !== undefined) {
        return [...store.state.hierarchyData.hierarchy[parentId].childrenEntityIds];
    } else {
        return [...store.getters.getTopLevelBlocks];
    }
}
function getImmediateChildren(store: Store, parentEntityId: string): string[] {
    return store.state.hierarchyData.hierarchy[parentEntityId].childrenEntityIds;
}
function getTransitiveDescendants(store: Store, parentEntityId: string) {
    return store.getters.getTransitiveDescendants(parentEntityId);
}
function getParentChain(store: Store, blockId: string) {
    return store.getters.getParentChain(blockId);
}


// ===========================
// Child / Parent Manipulation
// ---------------------------

function setParent(store: Store, childEntityId: string, parentEntityId: string | undefined) {
    store.dispatch("setParent", {entityId: childEntityId, newParent: parentEntityId});
}
function getParent(store: Store, blockId: string) {
    return store.state.hierarchyData.hierarchy[blockId]?.parentEntityId;
}

export function useHierarchyStore() {
    let store = useStore();

    return {
        rawState: store.state.hierarchyData,

        // -- Getters --
        visibleLinkPairs: () => visibleLinkPairs(store),
        entityScales:     () => entityScales(store),
        getSiblings:      (blockId: string) => getSiblings(store, blockId),
        getImmediateChildren:     (parentEntityId: string) => getImmediateChildren(store, parentEntityId),
        getTransitiveDescendants: (parentEntityId: string) => getTransitiveDescendants(store, parentEntityId),
        getParentChain:   (blockId: string) => getParentChain(store, blockId),

        // -- Child/Parent Manipulation --
        setParent: (childEntityId: string, parentEntityId: string | undefined) => setParent(store, childEntityId, parentEntityId),
        getParent: (blockId: string) => getParent(store, blockId),
    }
}