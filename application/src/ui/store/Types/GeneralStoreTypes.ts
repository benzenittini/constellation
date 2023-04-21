
import { BasicBoardData, BasicProjectData, CurrentProjectBoard, BoardConfig, RemoteProject, TypedMap } from 'constellation-common/datatypes';
import { AugmentedActionContext, GetterProperties } from "../StoreTypes"


// ================
// Store Data Types
// ----------------

// -- State --
export interface GeneralDataState {
    projectData: TypedMap<BasicProjectData>;
    remoteProjectLookup: { remoteProject: RemoteProject, projectId?: string, version?: string }[];
    currentProjectBoard: CurrentProjectBoard | undefined;
    uiFlags: {
        disablePointerEvents: boolean,
        panSpeed: number,
        zoomSpeed: number,
        switchCtrlShiftForSelection: boolean,
        useShiftToZoom: boolean,
        invertScrollDirection: boolean,
    };
    clientId: string;
    appVersion: string;
}

// -- Mutations --
export type GeneralDataMutations<S = GeneralDataState> = {
    resetStore      (state: S): void;
    clearBoardState (state: S): void;

    setCurrentProjectBoard (state: S, currentProjectBoard: CurrentProjectBoard): void;

    addProject             (state: S, projectData: BasicProjectData): void;
    removeProject          (state: S, projectId: string): void;
    setBoardsForProject    (state: S, data: { projectId: string, boards: TypedMap<BasicBoardData> }): void;
    addBoardToProject      (state: S, data: { projectId: string, boardData: BasicBoardData }): void;
    removeBoardFromProject (state: S, data: { projectId: string, boardId: string }): void;
    updateBoardConfig      (state: S, data: { projectId: string, boardId: string, boardConfig: BoardConfig }): void;

    registerRemoteProject   (state: S, data: { remoteProject: RemoteProject, projectId?: string, version?: string }): void;
    deregisterRemoteProject (state: S, data: { remoteProject: RemoteProject }): void;

    // UI Flags
    disablePointerEvents (state: S): void;
    enablePointerEvents  (state: S): void;
    setPanSpeed  (state: S, data: number): void;
    setZoomSpeed (state: S, data: number): void;
    switchCtrlShiftForSelection (state: S, value: boolean): void;
    useShiftToZoom              (state: S, value: boolean): void;
    invertScrollDirection       (state: S, value: boolean): void;
}

// -- Actions --
export interface GeneralDataActions {
    resetStore      ({ commit }: AugmentedActionContext<GeneralDataState>): void;
    logOut          ({ commit }: AugmentedActionContext<GeneralDataState>): void;
    clearBoardState ({ commit }: AugmentedActionContext<GeneralDataState>): void;

    setCurrentProjectBoard ({ commit }: AugmentedActionContext<GeneralDataState>, currentProjectBoard: CurrentProjectBoard): void;

    addProject             ({ commit }: AugmentedActionContext<GeneralDataState>, data: BasicProjectData): void;
    removeProject          ({ commit }: AugmentedActionContext<GeneralDataState>, projectId: string): void;
    setBoardsForProject    ({ commit }: AugmentedActionContext<GeneralDataState>, data: { projectId: string, boards: TypedMap<BasicBoardData> }): void;
    addBoardToProject      ({ commit }: AugmentedActionContext<GeneralDataState>, data: { projectId: string, boardData: BasicBoardData }): void;
    removeBoardFromProject ({ commit }: AugmentedActionContext<GeneralDataState>, data: { projectId: string, boardId: string }): void;
    updateBoardConfig      ({ commit }: AugmentedActionContext<GeneralDataState>, data: { projectId: string, boardId: string, boardConfig: BoardConfig }): void;

    registerRemoteProject   ({ commit }: AugmentedActionContext<GeneralDataState>, data: { remoteProject: RemoteProject, projectId?: string, version?: string }): void;
    deregisterRemoteProject ({ commit }: AugmentedActionContext<GeneralDataState>, data: { remoteProject: RemoteProject }): void;

    // UI Flags
    setDisablePointerEvents ({ commit }: AugmentedActionContext<GeneralDataState>, disablePointerEvents: boolean): void;
    setPanSpeed  ({ commit }: AugmentedActionContext<GeneralDataState>, panSpeed: number): void;
    setZoomSpeed ({ commit }: AugmentedActionContext<GeneralDataState>, zoomSpeed: number): void;
    switchCtrlShiftForSelection  ({ commit }: AugmentedActionContext<GeneralDataState>, value: boolean): void;
    useShiftToZoom               ({ commit }: AugmentedActionContext<GeneralDataState>, value: boolean): void;
    invertScrollDirection        ({ commit }: AugmentedActionContext<GeneralDataState>, value: boolean): void;
}

// -- Getters --
export type GeneralDataGetters<S = GeneralDataState> = {
    currentProjectBoard   (state: S, getters: GetterProperties): CurrentProjectBoard | undefined;
    isCurrentBoardRemote  (state: S, getters: GetterProperties): boolean;
    pointerEventsDisabled (state: S, getters: GetterProperties): boolean;
    getRemoteProjectById  (state: S, getters: GetterProperties): (projectId: string) => RemoteProject | undefined;
}
