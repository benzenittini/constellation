
import { Store as VuexStore, CommitOptions, ActionContext, DispatchOptions } from 'vuex';

import { GeneralDataState, GeneralDataGetters, GeneralDataMutations, GeneralDataActions } from './Types/GeneralDataTypes';
import { EntityDataState, EntityDataGetters, EntityDataMutations, EntityDataActions } from './Types/EntityDataTypes';
import { HierarchyDataState, HierarchyDataGetters, HierarchyDataMutations, HierarchyDataActions } from './Types/HierarchyDataTypes';
import { FieldDataState, FieldDataGetters, FieldDataMutations, FieldDataActions } from './Types/FieldDataTypes';
import { ViewDataState, ViewDataGetters, ViewDataMutations, ViewDataActions } from './Types/ViewDataTypes';


// ===============
// Top-Level Store
// ---------------

export interface RootState {
    generalData: GeneralDataState,
    entityData: EntityDataState,
    hierarchyData: HierarchyDataState,
    classificationData: FieldDataState,
    viewData: ViewDataState,
}

type AllGetters   = GeneralDataGetters   & EntityDataGetters   & HierarchyDataGetters   & FieldDataGetters   & ViewDataGetters;
type AllMutations = GeneralDataMutations & EntityDataMutations & HierarchyDataMutations & FieldDataMutations & ViewDataMutations;
type AllActions   = GeneralDataActions   & EntityDataActions   & HierarchyDataActions   & FieldDataActions   & ViewDataActions;

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

// Useful for all those (id --> Object) maps we use.
export type TypedMap<T> = { [key: string]: T }

export interface EntityLinkPair {
    id: string;
    source:      { entityId: string, isSelected: boolean, x: number, y: number, entityWidth: number, entityHeight: number };
    destination: { entityId: string, isSelected: boolean, x: number, y: number, entityWidth: number, entityHeight: number };
}