
import { AugmentedActionContext, EntityLinkPair, GetterProperties, TypedMap } from "../StoreTypes"


// ==========
// Vuex Types
// ----------

// -- State --
export interface HierarchyDataState {
    hierarchy: TypedMap<HierarchyNode>
}

// -- Mutations --
export type HierarchyDataMutations<S = HierarchyDataState> = {
    resetStore      (state: S): void;
    clearBoardState (state: S): void;
    clearHierarchy  (state: S): void;

    createNewNode (state: S, entityId: string): void;
    deleteNode    (state: S, entityId: string): void;

    assignParent (state: S, payload: {parentId: string, childId: string}): void;
    clearParent  (state: S, childId: string): void;

    addChild    (state: S, payload: {parentId: string, childId: string}): void;
    removeChild (state: S, payload: {parentId: string, childId: string}): void;
}

// -- Actions --
export interface HierarchyDataActions {
    resetStore      ({ commit }: AugmentedActionContext<HierarchyDataState>): void;
    clearBoardState ({ commit }: AugmentedActionContext<HierarchyDataState>): void;
    clearHierarchy  ({ commit }: AugmentedActionContext<HierarchyDataState>): void;

    createNode  ({ commit }: AugmentedActionContext<HierarchyDataState>, payload: {entityId: string, parentId: string | undefined}): void;
    deleteNode  ({ commit }: AugmentedActionContext<HierarchyDataState>, entityId: string): void;
    setParent   ({ commit, state, getters, rootState }: AugmentedActionContext<HierarchyDataState>, payload: {entityId: string, newParent: string | undefined}): void;
}

// -- Getters --
export type HierarchyDataGetters<S = HierarchyDataState> = {
    visibleHierarchyLinkPairs (state: S, getters: GetterProperties): EntityLinkPair[];
    entityScales (state: S, getters: GetterProperties): TypedMap<number>;
    getTopLevelBlocks (state: S): string[];
    getTransitiveDescendants: (state: S) => (parentEntityId: string) => string[];
    getParentChain: (state: S) => (entityId: string) => string[];
}


// =============
// Generic Types
// -------------

export interface HierarchyNode {
    parentEntityId: string | undefined;
    childrenEntityIds: string[];
}