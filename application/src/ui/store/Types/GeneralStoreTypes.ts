
import { BasicBoardData, BasicProjectData, CurrentProjectBoard } from "../../../../../common/DataTypes/BoardDataTypes";
import { TypedMap } from "../../../../../common/DataTypes/GenericDataTypes";
import { AugmentedActionContext, GetterProperties } from "../StoreTypes"


// ================
// Store Data Types
// ----------------

// -- State --
export interface GeneralDataState {
    projectData: TypedMap<BasicProjectData>;
    currentProjectBoard: CurrentProjectBoard | undefined;
    uiFlags: { disablePointerEvents: boolean };
}

// -- Mutations --
export type GeneralDataMutations<S = GeneralDataState> = {
    resetStore      (state: S): void;
    clearBoardState (state: S): void;

    setCurrentProjectBoard (state: S, currentProjectBoard: CurrentProjectBoard): void;

    addProject          (state: S, projectData: BasicProjectData): void;
    removeProject       (state: S, projectId: string): void;
    setBoardsForProject (state: S, data: { projectId: string, boards: TypedMap<BasicBoardData> }): void;
    addBoardToProject   (state: S, data: { projectId: string, boardData: BasicBoardData }): void;

    // UI Flags
    disablePointerEvents (state: S): void;
    enablePointerEvents  (state: S): void;
}

// -- Actions --
export interface GeneralDataActions {
    resetStore      ({ commit }: AugmentedActionContext<GeneralDataState>): void;
    logOut          ({ commit }: AugmentedActionContext<GeneralDataState>): void;
    clearBoardState ({ commit }: AugmentedActionContext<GeneralDataState>): void;

    setCurrentProjectBoard ({ commit }: AugmentedActionContext<GeneralDataState>, currentProjectBoard: CurrentProjectBoard): void;

    addProject          ({ commit }: AugmentedActionContext<GeneralDataState>, data: BasicProjectData): void;
    removeProject       ({ commit }: AugmentedActionContext<GeneralDataState>, projectId: string): void;
    setBoardsForProject ({ commit }: AugmentedActionContext<GeneralDataState>, data: { projectId: string, boards: TypedMap<BasicBoardData> }): void;
    addBoardToProject   ({ commit }: AugmentedActionContext<GeneralDataState>, data: { projectId: string, boardData: BasicBoardData }): void;

    // UI Flags
    setDisablePointerEvents ({ commit }: AugmentedActionContext<GeneralDataState>, disablePointerEvents: boolean): void;
}

// -- Getters --
export type GeneralDataGetters<S = GeneralDataState> = {
    currentProjectBoard   (state: S, getters: GetterProperties): CurrentProjectBoard | undefined;
    isCurrentBoardRemote  (state: S, getters: GetterProperties): boolean;
    pointerEventsDisabled (state: S, getters: GetterProperties): boolean;
}
