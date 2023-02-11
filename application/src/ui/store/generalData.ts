
import { MutationTree, ActionTree, GetterTree } from "vuex";

import { GeneralDataState, GeneralDataMutations, GeneralDataActions, GeneralDataGetters } from "./Types/GeneralDataTypes";
import { RootState } from "./StoreTypes";

// =====
// State
// -----

const generalDataState: GeneralDataState = {
    projectData: [],
    currentProjectBoard: undefined,
    authToken: undefined,
    permissions: {},
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
        state.projectData         = [];
        state.currentProjectBoard = undefined;
        state.authToken           = undefined;
        state.permissions         = {};
        state.uiFlags             = { disablePointerEvents: false }
    },
    clearBoardState (state) {
        state.projectData = [];
        state.currentProjectBoard = undefined;
        // (Not clearing auth token.)
        // (Not clearing permissions.)
        state.uiFlags = { disablePointerEvents: false }
    },

    setProjectData         (state, projectData)         { state.projectData = projectData;                   },
    setCurrentProjectBoard (state, currentProjectBoard) { state.currentProjectBoard = currentProjectBoard;   },
    setAuthToken           (state, authToken)           { state.authToken = authToken;                       },
    setPermissions         (state, permissions)         { state.permissions = permissions;                   },

    addProject        (state, projectData) { state.projectData.push(projectData); },
    addBoardToProject (state, {projectId, boardData}) {
        let project = state.projectData.find(p => p.projectId === projectId);
        if (project) {
            project.boards[boardData.boardId] = boardData;
        } else {
            // TODO-later : Throw an error? ... or at least might want to do something here.
        }
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

    setProjectData ({ commit }, projectData) { commit('setProjectData', projectData); },
    setCurrentProjectBoard ({ commit }, currentProjectBoard) { commit('setCurrentProjectBoard', currentProjectBoard); },
    setCurrentAppPermissions ({ commit }, { authToken, permissions }) {
        commit('setAuthToken', authToken);  
        commit('setPermissions', permissions);  
    },

    addProject        ({ commit }, projectData) { commit('addProject', projectData); },
    addBoardToProject ({ commit }, { projectId, boardData }) { commit('addBoardToProject', { projectId, boardData }); },

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
    currentPermissions: (state) => {
        let currentProject = state.currentProjectBoard?.projectId;
        let currentBoard = state.currentProjectBoard?.boardId;

        if (!currentProject || !currentBoard) return [];

        return [
            ...state.permissions[currentProject] ?? [],
            ...state.permissions[currentBoard] ?? [],
        ];
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