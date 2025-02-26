
import { MutationTree, ActionTree, GetterTree } from "vuex";
import { v4 as uuidv4 } from 'uuid';

import { GeneralDataState, GeneralDataMutations, GeneralDataActions, GeneralDataGetters } from "./Types/GeneralStoreTypes";
import { RootState } from "./StoreTypes";
import { LOCAL_PROJECT } from 'constellation-common/datatypes';

// =====
// State
// -----

const generalDataState: GeneralDataState = {
    projectData: {},
    remoteProjectLookup: [],
    currentProjectBoard: undefined,
    uiFlags: {
        // When dragging on the canvas, we disable all pointer events on other UI components
        // (like the title bar, config pane, etc), which prevents an annoying effect when the
        // user drags a thing over top of one of these things.
        disablePointerEvents: false,
        panSpeed: 1,
        zoomSpeed: 1,
        switchCtrlShiftForSelection: false,
        useShiftToZoom: false,
        invertScrollDirection: false,
    },
    clientId: uuidv4(),
    appVersion: WEBPACK.APP_VERSION,
}


// =========
// Mutations
// ---------

const generalDataMutations: MutationTree<GeneralDataState> & GeneralDataMutations = {
    resetStore (state) {
        state.projectData         = {};
        state.remoteProjectLookup = [];
        state.currentProjectBoard = undefined;
        state.uiFlags             = {
            disablePointerEvents: false,
            panSpeed: 1,
            zoomSpeed: 1,
            switchCtrlShiftForSelection: false,
            useShiftToZoom: false,
            invertScrollDirection: false,
        };
    },
    clearBoardState (state) {
        state.projectData         = {};
        state.remoteProjectLookup = [];
        state.currentProjectBoard = undefined;
        state.uiFlags.disablePointerEvents = false;
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
    removeBoardFromProject (state, {projectId, boardId}) {
        delete state.projectData[projectId].boards[boardId];
    },
    updateBoardConfig (state, {projectId, boardId, boardConfig}) {
        state.projectData[projectId].boards[boardId].boardName = boardConfig.name;
    },

    registerRemoteProject (state, { remoteProject, projectId, version, capabilities }) {
        let index = state.remoteProjectLookup.findIndex(proj => proj.remoteProject.serverUrl === remoteProject.serverUrl);
        if (index !== -1) {
            state.remoteProjectLookup[index] = { remoteProject, projectId, version, capabilities };
        } else {
            state.remoteProjectLookup.push({ remoteProject, projectId, version, capabilities });
        }
    },
    deregisterRemoteProject (state, { remoteProject }) {
        let index = state.remoteProjectLookup.findIndex(proj => proj.remoteProject.serverUrl === remoteProject.serverUrl);
        if (index !== -1) {
            state.remoteProjectLookup.splice(index, 1);
        }
    },

    // UI Flags
    disablePointerEvents (state) { state.uiFlags.disablePointerEvents = true;  },
    enablePointerEvents  (state) { state.uiFlags.disablePointerEvents = false; },
    setPanSpeed  (state, data) { state.uiFlags.panSpeed = data;  },
    setZoomSpeed (state, data) { state.uiFlags.zoomSpeed = data; },
    switchCtrlShiftForSelection (state, data) { state.uiFlags.switchCtrlShiftForSelection = data;  },
    useShiftToZoom              (state, data) { state.uiFlags.useShiftToZoom = data; },
    invertScrollDirection       (state, data) { state.uiFlags.invertScrollDirection = data; },
}


// =======
// Actions
// -------

const generalDataActions: ActionTree<GeneralDataState, RootState> & GeneralDataActions = {
    resetStore      ({ commit }) { commit('resetStore'); },
    logOut          ({ commit }) { commit('resetStore'); },
    clearBoardState ({ commit }) { commit('clearBoardState'); },

    setCurrentProjectBoard ({ commit }, currentProjectBoard) { commit('setCurrentProjectBoard', currentProjectBoard); },

    addProject             ({ commit }, projectData)                         { commit('addProject', projectData); },
    removeProject          ({ commit }, projectId)                           { commit('removeProject', projectId); },
    setBoardsForProject    ({ commit }, { projectId, boards })               { commit('setBoardsForProject', { projectId, boards }); },
    addBoardToProject      ({ commit }, { projectId, boardData })            { commit('addBoardToProject', { projectId, boardData }); },
    removeBoardFromProject ({ commit }, { projectId, boardId })              { commit('removeBoardFromProject', { projectId, boardId }); },
    updateBoardConfig      ({ commit }, { projectId, boardId, boardConfig }) { commit('updateBoardConfig', { projectId, boardId, boardConfig }); },

    registerRemoteProject   ({ commit }, data) { commit('registerRemoteProject', data); },
    deregisterRemoteProject ({ commit }, data) { commit('deregisterRemoteProject', data); },

    // UI Flags
    setDisablePointerEvents ({ commit }, disablePointerEvents) {
        commit(disablePointerEvents ? 'disablePointerEvents' : 'enablePointerEvents');
    },
    setPanSpeed  ({ commit }, panSpeed)  { commit('setPanSpeed', panSpeed); },
    setZoomSpeed ({ commit }, zoomSpeed) { commit('setZoomSpeed', zoomSpeed); },
    switchCtrlShiftForSelection ({ commit }, value) { commit('switchCtrlShiftForSelection', value); },
    useShiftToZoom              ({ commit }, value) { commit('useShiftToZoom', value); },
    invertScrollDirection       ({ commit }, value) { commit('invertScrollDirection', value); },
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
    },
    getRemoteProjectById: (state) => (projectId) => {
        let entry = state.remoteProjectLookup.find(proj => proj.projectId === projectId);
        return entry?.remoteProject;
    },
    currentProjectCapabilities: (state, {getRemoteProjectById}) => {
        const currentProjectId = state.currentProjectBoard?.projectId;
        const remoteProject = state.remoteProjectLookup.find(proj => proj.projectId === currentProjectId);
        return remoteProject?.capabilities || {};
    },
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