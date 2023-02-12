
import { TypedMap } from "./GenericDataTypes"

import { Block } from './BlockDataTypes';
import { ViewConfig } from './ViewDataTypes';
import { ClassificationDefinition, FieldDefinition, PossibleValueDefinition } from './FieldDataTypes';


// ===========
// Board Types
// -----------

export const LOCAL_PROJECT = "local";

export interface BasicProjectData {
    projectId: string;
    projectName: string;
    boards: TypedMap<BasicBoardData>;
}

export interface BasicBoardData {
    boardId: string;   // For local boards, ID is the filepath
    boardName: string; // Local boards, the name is the filename sans extension
}

export interface CurrentProjectBoard {
    projectId: string;
    boardId: string;
}

export type BoardData = {
    // Lookup Maps
    blocks:          TypedMap<Block>,
    views:           TypedMap<ViewConfig>,
    fields:          TypedMap<FieldDefinition>,
    classifications: TypedMap<ClassificationDefinition>,
    possibleValues:  TypedMap<PossibleValueDefinition>,
    // Used to determine ordering
    blockPriorities:   string[],
    classificationIds: string[],
}