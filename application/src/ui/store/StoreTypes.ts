
import { Store as VuexStore, CommitOptions, ActionContext, DispatchOptions } from 'vuex';

import { GeneralDataState, GeneralDataGetters, GeneralDataMutations, GeneralDataActions } from './Types/GeneralStoreTypes';
import { BlockDataState, BlockDataGetters, BlockDataMutations, BlockDataActions } from './Types/BlockStoreTypes';
import { HierarchyDataState, HierarchyDataGetters, HierarchyDataMutations, HierarchyDataActions } from './Types/HierarchyStoreTypes';
import { FieldDataState, FieldDataGetters, FieldDataMutations, FieldDataActions } from './Types/FieldStoreTypes';
import { ViewDataState, ViewDataGetters, ViewDataMutations, ViewDataActions } from './Types/ViewStoreTypes';


// ===============
// Top-Level Store
// ---------------

export interface RootState {
    generalData: GeneralDataState,
    blockData: BlockDataState,
    hierarchyData: HierarchyDataState,
    classificationData: FieldDataState,
    viewData: ViewDataState,
}

type AllGetters   = GeneralDataGetters   & BlockDataGetters   & HierarchyDataGetters   & FieldDataGetters   & ViewDataGetters;
type AllMutations = GeneralDataMutations & BlockDataMutations & HierarchyDataMutations & FieldDataMutations & ViewDataMutations;
type AllActions   = GeneralDataActions   & BlockDataActions   & HierarchyDataActions   & FieldDataActions   & ViewDataActions;

export type GetterProperties = { [K in keyof AllGetters]: ReturnType<AllGetters[K]> }

export type Store = Omit<VuexStore<RootState>, 'getters' | 'commit' | 'dispatch'>
& {
    commit<K extends keyof AllMutations, P extends Parameters<AllMutations[K]>[1]>(
        key: K, payload?: P, options?: CommitOptions
    ): ReturnType<AllMutations[K]>
} & {
    dispatch<K extends keyof AllActions>(
        key: K, payload?: Parameters<AllActions[K]>[1], options?: DispatchOptions
    ): ReturnType<AllActions[K]>
} & {
    getters: GetterProperties
}

export type AugmentedActionContext<S> = {
    commit<K extends keyof AllMutations>(
        key: K, payload?: Parameters<AllMutations[K]>[1]
    ): ReturnType<AllMutations[K]>
} & Omit<ActionContext<S, RootState>, 'commit'>;



// ========================
// Miscellaneous Data Types
// ------------------------

export interface BlockLinkPair {
    id: string;
    source:      { blockId: string, isSelected: boolean, x: number, y: number, blockWidth: number, blockHeight: number };
    destination: { blockId: string, isSelected: boolean, x: number, y: number, blockWidth: number, blockHeight: number };
}