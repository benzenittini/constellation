
import { MutationTree, ActionTree, GetterTree } from "vuex";

import { GeneralDataState, GeneralDataMutations, GeneralDataActions, GeneralDataGetters, DEMO_PROJECT_DATA } from "./Types/GeneralDataTypes";
import { RootState } from "./StoreTypes";

// =====
// State
// -----

const generalDataState: GeneralDataState = {
    userData: { username: undefined, userId: undefined, email: undefined },
    adminData: { isAdmin: false, jwt: undefined },
    planData: { hasPaidPlan: false },
    projectData: [],
    currentViewData: undefined,
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
        state.userData        = { username: undefined, userId: undefined, email: undefined };
        state.adminData       = { isAdmin: false, jwt: undefined };
        state.planData        = { hasPaidPlan: false };
        state.projectData     = [];
        state.currentViewData = undefined;
        state.authToken       = undefined;
        state.permissions     = {};
        state.uiFlags         = { disablePointerEvents: false }
    },
    clearBoardState (state) {
        // (Not clearing user data.)
        // (Not clearing admin data.)
        // (Not clearing plan data.)
        state.projectData = [];
        state.currentViewData = undefined;
        // (Not clearing auth token.)
        // (Not clearing permissions.)
        state.uiFlags = { disablePointerEvents: false }
    },

    setUsername    (state, username)    { state.userData.username = username;                },
    setUserId      (state, userId)      { state.userData.userId = userId;                    },
    setEmail       (state, email)       { state.userData.email = email;                      },
    setIsAdmin     (state, isAdmin)     { state.adminData.isAdmin = isAdmin;                 },
    setAdminJwt    (state, adminJwt)    { state.adminData.jwt = adminJwt;                    },
    setPlanData    (state, planData)    { state.planData.hasPaidPlan = planData.hasPaidPlan; },
    setProjectData (state, projectData) { state.projectData = projectData;                   },
    setCurrentView (state, currentView) { state.currentViewData = currentView;               },
    setAuthToken   (state, authToken)   { state.authToken = authToken;                       },
    setPermissions (state, permissions) { state.permissions = permissions;                   },

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

    setUsername    ({ commit }, username)    { commit('setUsername',    username);    },
    setUserId      ({ commit }, userId)      { commit('setUserId',      userId);      },
    setEmail       ({ commit }, email)       { commit('setEmail',       email);       },
    setIsAdmin     ({ commit }, isAdmin)     { commit('setIsAdmin',     isAdmin);     },
    setAdminJwt    ({ commit }, adminJwt)    { commit('setAdminJwt',    adminJwt);     },
    setPlanData    ({ commit }, planData)    { commit('setPlanData',    planData);    },
    setProjectData ({ commit }, projectData) { commit('setProjectData', projectData); },
    setCurrentView ({ commit }, currentView) { commit('setCurrentView', currentView); },
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
    currentPermissions: (state) => {
        let currentProject = state.currentViewData?.projectId;
        let currentBoard = state.currentViewData?.boardId;

        if (!currentProject || !currentBoard) return [];

        return [
            ...state.permissions[currentProject] ?? [],
            ...state.permissions[currentBoard] ?? [],
        ];
    },
    inDemoMode: (state) => {
        return state.currentViewData?.projectId === DEMO_PROJECT_DATA.id;
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