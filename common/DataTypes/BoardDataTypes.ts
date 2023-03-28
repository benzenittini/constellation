
import { TypedMap } from "./GenericDataTypes"

import { Block, verifyBlock } from './BlockDataTypes';
import { ViewConfig, verifyViewConfig } from './ViewDataTypes';
import { ClassificationDefinition, FieldDefinition, FieldType, PossibleValueDefinition, verifyClassificationDefinition, verifyFieldDefinition, verifyPossibleValueDefinition } from './FieldDataTypes';
import { isObject, isObjectWithKeys } from "../utilities/ObjectUtils";
import { isString } from "../utilities/StringUtils";


// ===========
// Board Types
// -----------

export const LOCAL_PROJECT = "local";
export const LOCAL_PROJECT_NAME = "Local Boards";

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

export function verifyBoardData(data: any): data is BoardData {
    // Make sure the required top-level keys all exist.
    if (!(
        'blocks' in data &&
        'views' in data &&
        'fields' in data &&
        'classifications' in data &&
        'possibleValues' in data &&
        'blockPriorities' in data &&
        'classificationIds' in data
    )) {
        return false;
    }

    // Make sure each block is actually a block
    if (!isObject(data.blocks)) return false;
    for (let blockId in data.blocks) {
        if (!verifyBlock(data.blocks[blockId])) return false;
    }

    // Make sure each view is actually a view
    if (!isObject(data.views)) return false;
    for (let viewId in data.views) {
        if (!verifyViewConfig(data.views[viewId])) return false;
    }

    // Make sure each field is actually a field
    if (!isObject(data.fields)) return false;
    for (let fieldId in data.fields) {
        if (!verifyFieldDefinition(data.fields[fieldId])) return false;
    }

    // Make sure each classification is actually a classification
    if (!isObject(data.classifications)) return false;
    for (let cid in data.classifications) {
        if (!verifyClassificationDefinition(data.classifications[cid])) return false;
    }

    // Make sure each PV is actually a PV
    if (!isObject(data.possibleValues)) return false;
    for (let pvid in data.possibleValues) {
        if (!verifyPossibleValueDefinition(data.possibleValues[pvid])) return false;
    }

    // Verify the block priorities are all valid
    if (!Array.isArray(data.blockPriorities)) return false;
    for (let priority of data.blockPriorities) {
        if (!isString(priority))    return false;
        if (!data.blocks[priority]) return false;
    }

    // Verify the classificationIds are all valid
    if (!Array.isArray(data.classificationIds)) return false;
    for (let cid of data.classificationIds) {
        if (!isString(cid)) return false;
        if (!data.classifications[cid]) return false;
    }

    return true;
}


// ===============
// Board Templates
// ---------------

export type BoardTemplate = {
    projectId: string,
    boardId: string,
    classifications: TemplateClassification[],
}
// Only populated for responses to the client, not for persistence.
export type BoardTemplateClient = BoardTemplate & {
    projectName: string, 
    boardName: string,
}
export type TemplateClassification = {
    name: string,
    fields: TemplateField[],
}
export type TemplateField = {
    name: string,
    type: FieldType,
    possibleValues: TemplatePV[],
    sourceType: 'classification';
}
export type TemplatePV = {
    name: string;
    style?: any;
}