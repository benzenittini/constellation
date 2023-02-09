
import { computed } from 'vue';

import { useStore } from './store';
import { Store } from './StoreTypes';

import { AdminData, BasicBoardData, BasicProjectData, PlanData } from './Types/GeneralDataTypes';

// TODO-const : Re-enable all the actions
// import { LoadSessionData } from "../common/actions/RestActions/LoadSessionData";

function userData(store: Store) {
    let userData = computed(() => store.state.generalData.userData);

    if (!userData.value.userId || !userData.value.username || !userData.value.email) {
        // TODO-const : Re-enable all the actions
        // new LoadSessionData().send(({data}) => {
        //     if (data) {
        //         // We should be getting all three or none... but let's not assume that.
        //         if (data.username) store.dispatch('setUsername', data.username);
        //         if (data.userId)   store.dispatch('setUserId',   data.userId);
        //         if (data.email)    store.dispatch('setEmail',    data.email);
        //         if (data.isAdmin)  store.dispatch('setIsAdmin',  data.isAdmin);
        //     }
        // });
    }

    return userData;
}

function adminData(store: Store) {
    return computed(() => store.state.generalData.adminData);
}
function setAdminData(store: Store, adminData: Partial<AdminData>) {
    if ('jwt' in adminData) {
        store.dispatch('setAdminJwt', adminData.jwt);
    }
}

function projectsAndBoards(store: Store) {
    return computed(() => store.state.generalData.projectData);
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

function inDemoMode(store: Store) {
    return computed(() => store.getters.inDemoMode);
}

function setPlanData(store: Store, planData: PlanData) {
    store.dispatch('setPlanData', planData);
}
function hasPaidPlan(store: Store) {
    return computed(() => store.state.generalData.planData.hasPaidPlan);
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

        userData:              () => userData(store),
        adminData:             () => adminData(store),
        setAdminData:          (adminData: Partial<AdminData>) => setAdminData(store, adminData),
        projectsAndBoards:     () => projectsAndBoards(store),
        authToken:             () => authToken(store),
        currentAppPermissions: () => currentAppPermissions(store),
        inDemoMode:            () => inDemoMode(store),

        setPlanData: (planData: PlanData) => setPlanData(store, planData),
        hasPaidPlan: () => hasPaidPlan(store),

        setProjectData:    (projectData: BasicProjectData[]) => setProjectData(store, projectData),
        addProject:        (newProject: BasicProjectData) => addProject(store, newProject),
        addBoardToProject: (projectId: string, newBoard: BasicBoardData) => addBoardToProject(store, projectId, newBoard),

        // UI Flags
        setDisablePointerEvents: (disablePointerEvents: boolean) => setDisablePointerEvents(store, disablePointerEvents),
        pointerEventsDisabled:   () => pointerEventsDisabled(store),
    }
}