
import { MutationTree, ActionTree, GetterTree, Module } from "vuex";
import { ViewDataState, ViewDataGetters, ViewDataMutations, ViewDataActions, filterBlocks } from "./Types/ViewStoreTypes";
import { RootState } from "./StoreTypes";
import { computed } from "vue";

// =====
// State
// -----

const viewDataState: ViewDataState = {
    availableViews: {},
    activeViewConfig: undefined,
}


// =========
// Mutations
// ---------

const viewDataMutations: MutationTree<ViewDataState> & ViewDataMutations = {
    resetStore (state) {
        state.availableViews = {};
        state.activeViewConfig = undefined;
    },
    clearBoardState (state) {
        state.availableViews = {};
        state.activeViewConfig = undefined;
    },

    setAvailableViews   (state, views)  { state.availableViews = views;         },
    addAvailableView    (state, view)   { state.availableViews[view.id] = view; },
    removeAvailableView (state, viewId) { delete state.availableViews[viewId];  },
    setActiveView       (state, view)   { state.activeViewConfig = view;        },
    clearActiveView     (state)         { state.activeViewConfig = undefined;   },
}


// =======
// Actions
// -------

const viewDataActions: ActionTree<ViewDataState, RootState> & ViewDataActions = {
    resetStore      ({ commit }) { commit('resetStore'); },
    clearBoardState ({ commit }) { commit('clearBoardState'); },

    // -- View Crud --
    setAvailableViews({ commit }, views) {
        commit('setAvailableViews', views);
    },
    addView({ commit }, view) {
        commit('addAvailableView', view);
    },
    deleteView({ commit, state }, viewId) {
        // Remove & clear active view if it's the same.
        if (state.activeViewConfig?.id === viewId) {
            commit('clearActiveView');
        }
        // And remove the view from existence - *poof*!
        commit('removeAvailableView', viewId);
    },
    openView({ commit }, view) {
        commit('setActiveView', view);
    },
    closeView({ commit }) {
        commit('clearActiveView');
    },
}


// =======
// Getters
// -------

const viewDataGetters: GetterTree<ViewDataState, RootState> & ViewDataGetters = {
    availableViewsForType: (state, getters, rootState) => (viewType) => {
        return Object.values(state.availableViews)
            .sort((a, b) => ('' + a.name).localeCompare(b.name))
            .filter(view => viewType ? view.type === viewType : true);
    },
    displayedBlocks: (state, getters, rootState) => {
        if (!state.activeViewConfig) {
            return [];
        }

        return filterBlocks(
            Object.values(rootState.blockData.blocks),
            state.activeViewConfig.filter,
            getters.possibleValues,
            getters.fieldIdToClassificationId);
    },
    relevantPriorities: (state, getters, rootState) => {
        if (!state.activeViewConfig) {
            return [];
        }

        let displayedBlocks = getters.displayedBlocks;

        return getters.blockPriorities
            .filter(blockId => displayedBlocks.some(b => b.id === blockId));
    },
    prioritizedBlocks: (state, getters, rootState) => {
        if (!state.activeViewConfig) {
            return [];
        }
        let displayedBlocks = getters.displayedBlocks;

        // Sort by priority
        let priorities = getters.relevantPriorities;
        for (let x = priorities.length-1; x >= 0; x--) {
            let indexOf = displayedBlocks.findIndex(b => b.id === priorities[x]);
            if (indexOf !== -1) {
                let block = displayedBlocks.splice(indexOf, 1);
                displayedBlocks.unshift(...block);
            }
        }

        return displayedBlocks;
    },
}


// =====
// Store
// -----

export const viewDataStore: Module<ViewDataState, RootState> = {
    state: viewDataState,
    getters: viewDataGetters,
    mutations: viewDataMutations,
    actions: viewDataActions
}