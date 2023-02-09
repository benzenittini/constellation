
import { AugmentedActionContext, GetterProperties, TypedMap } from "../StoreTypes"


// ================
// Store Data Types
// ----------------

// -- State --
export interface GeneralDataState {
    userData: BasicUserData;
    adminData: AdminData;
    planData: PlanData;
    projectData: BasicProjectData[];
    currentViewData: CurrentViewData | undefined;
    authToken: string | undefined;
    permissions: TypedMap<string[]>;
    uiFlags: { disablePointerEvents: boolean };
}

// -- Mutations --
export type GeneralDataMutations<S = GeneralDataState> = {
    resetStore      (state: S): void;
    clearBoardState (state: S): void;

    setUsername    (state: S, username: string | undefined): void;
    setUserId      (state: S, userId: string | undefined): void;
    setEmail       (state: S, email: string | undefined): void;
    setIsAdmin     (state: S, isAdmin: boolean): void;
    setAdminJwt    (state: S, adminJwt: string): void;
    setProjectData (state: S, projectData: BasicProjectData[]): void;
    setPlanData    (state: S, planData: PlanData): void;
    setCurrentView (state: S, currentView: CurrentViewData): void;
    setAuthToken   (state: S, newToken: string): void;
    setPermissions (state: S, permissions: TypedMap<string[]>): void;

    addProject        (state: S, projectData: BasicProjectData): void;
    addBoardToProject (state: S, data: { projectId: string, boardData: BasicBoardData }): void;

    // UI Flags
    disablePointerEvents (state: S): void;
    enablePointerEvents  (state: S): void;
}

// -- Actions --
export interface GeneralDataActions {
    resetStore      ({ commit }: AugmentedActionContext<GeneralDataState>): void;
    logOut          ({ commit }: AugmentedActionContext<GeneralDataState>): void;
    clearBoardState ({ commit }: AugmentedActionContext<GeneralDataState>): void;

    setUsername    ({ commit }: AugmentedActionContext<GeneralDataState>, username: string): void;
    setUserId      ({ commit }: AugmentedActionContext<GeneralDataState>, userId: string): void;
    setEmail       ({ commit }: AugmentedActionContext<GeneralDataState>, email: string): void;
    setIsAdmin     ({ commit }: AugmentedActionContext<GeneralDataState>, isAdmin: boolean): void;
    setAdminJwt    ({ commit }: AugmentedActionContext<GeneralDataState>, adminJwt: string): void;
    setPlanData    ({ commit }: AugmentedActionContext<GeneralDataState>, planData: PlanData): void;
    setProjectData ({ commit }: AugmentedActionContext<GeneralDataState>, projectData: BasicProjectData[]): void;
    setCurrentView ({ commit }: AugmentedActionContext<GeneralDataState>, currentView: CurrentViewData): void;
    setCurrentAppPermissions ({ commit }: AugmentedActionContext<GeneralDataState>, payload: { authToken: string, permissions: TypedMap<string[]> }): void;

    addProject        ({ commit }: AugmentedActionContext<GeneralDataState>, projectData: BasicProjectData): void;
    addBoardToProject ({ commit }: AugmentedActionContext<GeneralDataState>, data: { projectId: string, boardData: BasicBoardData }): void;

    // UI Flags
    setDisablePointerEvents ({ commit }: AugmentedActionContext<GeneralDataState>, disablePointerEvents: boolean): void;
}

// -- Getters --
export type GeneralDataGetters<S = GeneralDataState> = {
    currentPermissions (state: S, getters: GetterProperties): string[];
    inDemoMode (state: S): boolean;
}


// ===============
// Permission Data
// ---------------

export const VALID_PROJECT_PERMISSIONS = [
    { key: "PROJECT_VIEW",               default: true,  display: "View Project",       tooltip: "The ability to view this project and its permissions list, but not necessarily the boards."},
    { key: "PROJECT_ADD_BOARD",          default: true,  display: "Create Boards",      tooltip: "The ability to create new boards within this project."},
    { key: "PROJECT_RENAME",             default: false, display: "Rename Project",     tooltip: "The ability to rename this project."},
    { key: "PROJECT_DELETE",             default: false, display: "Delete Project",     tooltip: "The ability to delete this project."},
    { key: "PROJECT_CHANGE_PERMISSIONS", default: false, display: "Manage Permissions", tooltip: "The ability to modify this permissions table."},
    { key: "PROJECT_OWNER",              default: false, display: "Owner",              tooltip: "Owner of the project. Has all permissions."},
];
export const VALID_BOARD_PERMISSIONS = [
    { key: "BOARD_VIEW_EXISTENCE",       default: true,  display: "View Existence",       tooltip: "The ability to see this board on this 'projects' page, as well as its permissions list."},
    { key: "BOARD_VIEW_CONTENTS",        default: true,  display: "View Contents",        tooltip: "The ability to open up this board and view its contents."},
    { key: "BOARD_EDIT_CONTENTS",        default: true,  display: "Edit Contents",        tooltip: "The ability to create/modify blocks on the board."},
    { key: "BOARD_EDIT_CLASSIFICATIONS", default: false, display: "Edit Classifications", tooltip: "The ability to modify the classifications and fields defined within this board."},
    { key: "BOARD_RENAME",               default: false, display: "Rename",               tooltip: "The ability to rename this board."},
    { key: "BOARD_DELETE",               default: false, display: "Delete",               tooltip: "The ability to delete this board"},
    { key: "BOARD_CHANGE_PERMISSIONS",   default: false, display: "Manage Permissions",   tooltip: "The ability to modify this permissions table."},
    { key: "BOARD_OWNER",                default: false, display: "Owner",                tooltip: "Owner of the board. Has all permissions."},
];


// ==============
// Demo Constants
// --------------

export const DEMO_PROJECT_DATA = { id: 'demo', name: 'Demo' };
export const DEMO_ORDERING = [
    'demo-courseorg',
    'demo-marscolonization',
    'demo-sandbox',
    // 'demo-projmanagement',
    // 'demo-notetaking',
];
export const DEMO_DATA: TypedMap<any> = {
    'demo-courseorg':        { id: 'demo-courseorg',        name: 'Course Organization', image: '/graphics/demo-courseorg.png',        desc: "If you're taking coursework, Spacia can help you track dates for tests, assignments, the relevant people, and tame the hundreds of website bookmarks you've likely been given." },
    'demo-marscolonization': { id: 'demo-marscolonization', name: 'Mars Colonization',   image: '/graphics/demo-marscolonization.png', desc: "Let's go to Mars! We're absolutely definitely not planning to make a Mars colony (probably), but if we were ... it might look suspiciously similar to this." },
    'demo-sandbox':          { id: 'demo-sandbox',          name: 'Sandbox',             image: '/graphics/demo-sandbox.png',          desc: "An empty board for you to experiment on. For science, of course!" },
    // 'demo-projmanagement':   { comingSoon: true, id: 'demo-projmanagement',   name: 'Project Management',  image: '/graphics/demo-projmanagement.png', desc: "Our main goal is to make projects more manageable - something we felt other tools fell short on. There are many approaches you can take, but this example captures the basics." },
    // 'demo-notetaking':       { comingSoon: true, id: 'demo-notetaking',       name: 'Note Taking',         image: '/graphics/demo-notetaking.png',     desc: "An example notebook demonstrating one approach to notetaking using Spacia." },
};


// ==========
// Data Types
// ----------

export interface Permission {
    sourceId: string; // Email for users, ?? for groups
    permissionKey: string;
}

export interface BasicUserData {
    username: string | undefined;
    userId: string | undefined;
    email: string | undefined;
}

export interface AdminData {
    isAdmin: boolean;
    jwt: string | undefined;
}

export interface PlanData {
    hasPaidPlan: boolean;
}

export interface BasicProjectData {
    projectId: string;
    projectName: string;
    boards: TypedMap<BasicBoardData>;
    isMember: boolean | undefined;
    permissions: string[] | undefined;
    owners?: string[] | undefined;
}

export interface BasicBoardData {
    boardId: string;
    boardName: string;
    color: string;
    isMember: boolean | undefined;
    permissions: string[] | undefined;
    owners?: string[] | undefined;
}

export interface CurrentViewData {
    projectId: string;
    boardId: string;
}
