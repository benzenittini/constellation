
import { TypedMap } from 'constellation-common/datatypes';
import { AugmentedActionContext, BlockLinkPair, GetterProperties } from "../StoreTypes"


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

    createNewNode (state: S, blockId: string): void;
    deleteNode    (state: S, blockId: string): void;

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

    createNode  ({ commit }: AugmentedActionContext<HierarchyDataState>, payload: {blockId: string, parentId: string | undefined}): void;
    deleteNode  ({ commit }: AugmentedActionContext<HierarchyDataState>, blockId: string): void;
    setParent   ({ commit, state, getters, rootState }: AugmentedActionContext<HierarchyDataState>, payload: {blockId: string, newParent: string | undefined, focalPoint?: {x: number, y: number}}): void;
}

// -- Getters --
export type HierarchyDataGetters<S = HierarchyDataState> = {
    visibleHierarchyLinkPairs (state: S, getters: GetterProperties): BlockLinkPair[];
    blockScales               (state: S, getters: GetterProperties): TypedMap<number>;
    getTopLevelBlocks         (state: S): string[];
    getTransitiveDescendants  (state: S): (parentBlockId: string) => string[];
    getParentChain            (state: S): (blockId: string) => string[];
    getSiblings               (state: S, getters: GetterProperties): (blockId: string) => string[];
}


// =============
// Generic Types
// -------------

export interface HierarchyNode {
    parentBlockId: string | undefined;
    childrenBlockIds: string[];
}