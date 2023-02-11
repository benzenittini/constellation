
import { AugmentedActionContext, GetterProperties, TypedMap } from "../StoreTypes"


// ================
// Store Data Types
// ----------------

// -- State --
export interface GeneralDataState {
    projectData: BasicProjectData[];
    currentProjectBoard: CurrentProjectBoard | undefined;
    authToken: string | undefined;
    permissions: TypedMap<string[]>;
    uiFlags: { disablePointerEvents: boolean };
}

// -- Mutations --
export type GeneralDataMutations<S = GeneralDataState> = {
    resetStore      (state: S): void;
    clearBoardState (state: S): void;

    setProjectData         (state: S, projectData: BasicProjectData[]): void;
    setCurrentProjectBoard (state: S, currentProjectBoard: CurrentProjectBoard): void;
    setAuthToken           (state: S, newToken: string): void;
    setPermissions         (state: S, permissions: TypedMap<string[]>): void;

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

    setProjectData ({ commit }: AugmentedActionContext<GeneralDataState>, projectData: BasicProjectData[]): void;
    setCurrentProjectBoard ({ commit }: AugmentedActionContext<GeneralDataState>, currentProjectBoard: CurrentProjectBoard): void;
    setCurrentAppPermissions ({ commit }: AugmentedActionContext<GeneralDataState>, payload: { authToken: string, permissions: TypedMap<string[]> }): void;

    addProject        ({ commit }: AugmentedActionContext<GeneralDataState>, projectData: BasicProjectData): void;
    addBoardToProject ({ commit }: AugmentedActionContext<GeneralDataState>, data: { projectId: string, boardData: BasicBoardData }): void;

    // UI Flags
    setDisablePointerEvents ({ commit }: AugmentedActionContext<GeneralDataState>, disablePointerEvents: boolean): void;
}

// -- Getters --
export type GeneralDataGetters<S = GeneralDataState> = {
    currentProjectBoard   (state: S, getters: GetterProperties): CurrentProjectBoard | undefined;
    isCurrentBoardRemote  (state: S, getters: GetterProperties): boolean;
    currentPermissions    (state: S, getters: GetterProperties): string[];
    pointerEventsDisabled (state: S, getters: GetterProperties): boolean;
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


// ==========
// Data Types
// ----------

export const LOCAL_PROJECT = "local";

export interface Permission {
    sourceId: string; // Email for users, ?? for groups
    permissionKey: string;
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

export interface CurrentProjectBoard {
    projectId: string;
    boardId: string;
}
