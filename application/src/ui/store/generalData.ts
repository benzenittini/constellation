
import { MutationTree, ActionTree, GetterTree } from "vuex";

import { GeneralDataState, GeneralDataMutations, GeneralDataActions, GeneralDataGetters, LOCAL_PROJECT } from "./Types/GeneralDataTypes";
import { RootState } from "./StoreTypes";

// =====
// State
// -----

const generalDataState: GeneralDataState = {
    projectData: {},
    currentProjectBoard: undefined,
    uiFlags: {
        // When dragging on the canvas, we disable all pointer events on other UI components
        // (like the title bar, config pane, etc), which prevents an annoying effect when the
        // user drags a thing over top of one of these things.
        disablePointerEvents: false
    }
}


// =========
// Mutations
// ---------

const generalDataMutations: MutationTree<GeneralDataState> & GeneralDataMutations = {
    resetStore (state) {
        state.projectData         = {};
        state.currentProjectBoard = undefined;
        state.uiFlags             = { disablePointerEvents: false }
    },
    clearBoardState (state) {
        state.projectData = {};
        state.currentProjectBoard = undefined;
        state.uiFlags = { disablePointerEvents: false }
    },

    setCurrentProjectBoard (state, currentProjectBoard) { state.currentProjectBoard = currentProjectBoard;   },

    addProject (state, projectData) {
        state.projectData[projectData.projectId] = projectData;
    },
    removeProject (state, projectId) {
        delete state.projectData[projectId];
    },
    setBoardsForProject(state, { projectId, boards }) {
        state.projectData[projectId].boards = boards;
    },
    addBoardToProject (state, {projectId, boardData}) {
        state.projectData[projectId].boards[boardData.boardId] = boardData;
    },

    // UI Flags
    disablePointerEvents (state) { state.uiFlags.disablePointerEvents = true;  },
    enablePointerEvents  (state) { state.uiFlags.disablePointerEvents = false; },
}


// =======
// Actions
// -------

const generalDataActions: ActionTree<GeneralDataState, RootState> & GeneralDataActions = {
    resetStore      ({ commit }) { commit('resetStore'); },
    logOut          ({ commit }) { commit('resetStore'); },
    clearBoardState ({ commit }) { commit('clearBoardState'); },

    setCurrentProjectBoard ({ commit }, currentProjectBoard) { commit('setCurrentProjectBoard', currentProjectBoard); },

    addProject          ({ commit }, projectData) { commit('addProject', projectData); },
    removeProject       ({ commit }, projectId)                  { commit('removeProject', projectId); },
    setBoardsForProject ({ commit }, { projectId, boards })      { commit('setBoardsForProject', { projectId, boards }); },
    addBoardToProject   ({ commit }, { projectId, boardData })   { commit('addBoardToProject', { projectId, boardData }); },

    // UI Flags
    setDisablePointerEvents ({ commit }, disablePointerEvents) {
        commit(disablePointerEvents ? 'disablePointerEvents' : 'enablePointerEvents');
    },
}


// =======
// Getters
// -------

const generalDataGetters: GetterTree<GeneralDataState, RootState> & GeneralDataGetters = {
    currentProjectBoard: (state) => {
        return state.currentProjectBoard;
    },
    isCurrentBoardRemote: (state) => {
        let currentProject = state.currentProjectBoard?.projectId;
        return currentProject !== undefined && currentProject !== LOCAL_PROJECT;
    },
    pointerEventsDisabled: (state) => {
        return state.uiFlags.disablePointerEvents;
    }
}


// =====
// Store
// -----

export const generalDataStore = {
    state: generalDataState,
    getters: generalDataGetters,
    mutations: generalDataMutations,
    actions: generalDataActions
}