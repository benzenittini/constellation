
import { computed } from 'vue';

import { useStore } from './store';
import { Store } from './StoreTypes';

import { BasicBoardData, BasicProjectData } from './Types/GeneralDataTypes';


function currentProjectBoard(store: Store) {
    return computed(() => store.state.generalData.currentProjectBoard);
}
function projectsAndBoards(store: Store) {
    return computed(() => store.state.generalData.projectData);
}
function setCurrentProjectBoard(store: Store, projectId: string, boardId: string) {
    store.dispatch('setCurrentProjectBoard', { projectId, boardId });
}

function authToken(store: Store) {
    // In this case, we don't actually want to request the auth token if it doesn't exist.
    // It gets loaded when the application page loads, and then never changes.
    // In the future, we might want to add an expiration, and re-fetch it if needed,
    // but it is not this day.
    //   -Aragorn, probably
    return computed(() => store.state.generalData.authToken);
}

function currentAppPermissions(store: Store) {
    return computed(() => store.getters.currentPermissions);
}

function setProjectData(store: Store, projectData: BasicProjectData[]) {
    store.dispatch('setProjectData', projectData);
}
function addProject(store: Store, newProject: BasicProjectData) {
    store.dispatch('addProject', newProject);
}
function addBoardToProject(store: Store, projectId: string, newBoard: BasicBoardData) {
    store.dispatch('addBoardToProject', {projectId, boardData: newBoard});
}


// ========
// UI Flags
// --------

function setDisablePointerEvents(store: Store, disablePointerEvents: boolean) {
    store.dispatch('setDisablePointerEvents', disablePointerEvents);
}
function pointerEventsDisabled(store: Store) {
    return computed(() => store.state.generalData.uiFlags.disablePointerEvents);
}

export function useGeneralStore() {
    let store = useStore();

    return {
        rawState: store.state.generalData,

        currentProjectBoard:    () => currentProjectBoard(store),
        projectsAndBoards:      () => projectsAndBoards(store),
        setCurrentProjectBoard: (projectId: string, boardId: string) => setCurrentProjectBoard(store, projectId, boardId),

        authToken:             () => authToken(store),
        currentAppPermissions: () => currentAppPermissions(store),

        setProjectData:    (projectData: BasicProjectData[]) => setProjectData(store, projectData),
        addProject:        (newProject: BasicProjectData) => addProject(store, newProject),
        addBoardToProject: (projectId: string, newBoard: BasicBoardData) => addBoardToProject(store, projectId, newBoard),

        // UI Flags
        setDisablePointerEvents: (disablePointerEvents: boolean) => setDisablePointerEvents(store, disablePointerEvents),
        pointerEventsDisabled:   () => pointerEventsDisabled(store),
    }
}