import { isString } from "../utilities/StringUtils";
import { isBoolean } from "../utilities/BooleanUtils";
import { BoundingBox, TypedMap } from "./GenericDataTypes";
import { ObjectUtils } from "../utilities";

export const DEFAULT_BLOCK_WIDTH = 200;
export const DEFAULT_BLOCK_HEIGHT = 60;
export const MIN_BLOCK_WIDTH = 75;
export const MIN_BLOCK_HEIGHT = 50;
export const DEFAULT_BLOCK_CONTENT: BlockContent = {type: 'text', data: { text: ''}};

export class Block {
    id: string;
    location: BoundingBox;
    content: BlockContent;

    fieldValues: TypedMap<any>; // fieldId --> fieldValue
    fieldIds: string[];
    classificationIds: string[];

    // Persistence-Layer Specific
    parentBlockId?: string | undefined;

    // UI Specific
    isSelected?: boolean;
    isLockedOpen?: boolean;

    constructor(id: string, location: BoundingBox, parentBlockId?: string | undefined, content: BlockContent = DEFAULT_BLOCK_CONTENT,
                fieldValues: TypedMap<any> = {}, classificationIds: string[] = [], fieldIds: string[] = []) {
        this.id = id;
        this.location = location;
        this.parentBlockId = parentBlockId;
        this.content = content;
        this.fieldValues = fieldValues;
        this.classificationIds = classificationIds;
        this.fieldIds = fieldIds;
    }
}

export function verifyBlock(data: any): data is Block {
    // Make sure the required top-level keys all exist.
    if (!data || !(
        'id' in data &&
        'location' in data &&
        'content' in data &&
        'fieldValues' in data &&
        'fieldIds' in data &&
        'classificationIds' in data
    )) {
        return false;
    }

    // Verify id is a string
    if (!isString(data.id)) {
        return false;
    }

    // Verify location is a BoundingBox
    if (isNaN(data.location?.x) ||
        isNaN(data.location?.y) ||
        isNaN(data.location?.width) ||
        isNaN(data.location?.height)
    ) {
        return false;
    }

    // Verify content extends BlockContent
    if (!verifyBlockContent(data.content)) return false;

    // Verify fieldValues is an object
    if (!ObjectUtils.isObject(data.fieldValues)) return false;

    // Verify fieldIds is an array of strings
    if (!Array.isArray(data.fieldIds)) return false;
    for (let fid of data.fieldIds) {
        if (!isString(fid)) return false;
    }

    // Verify classificationIds is an array of strings
    if (!Array.isArray(data.classificationIds)) return false;
    for (let cid of data.classificationIds) {
        if (!isString(cid)) return false;
    }

    // If set, verify parentBlockId is a string
    if (data.parentBlockId && !isString(data.parentBlockId)) {
        return false;
    }

    // If set, verify isSelected is a boolean
    if (data.isSelected && !isBoolean(data.isSelected)) {
        return false;
    }

    // If set, verify isLockedOpen is a boolean
    if (data.isLockedOpen && !isBoolean(data.isLockedOpen)) {
        return false;
    }

    return true;
}

export interface BlockIdAndPosition {
    blockId: string;
    location: BoundingBox;
}

export type BlockContent = TextContentType; // | AnotherType | AnotherOne
export interface TextContentType {
    type: 'text';
    data: { text: string; }
}

export function verifyBlockContent(data: any): data is BlockContent {
    if (!data || !(
        'type' in data &&
        'data' in data
    )) {
        return false;
    }

    if (data.type === 'text') {
        if (!isString(data.data?.text)) return false;
    } else {
        return false; // Unrecognized type
    }

    return true;
}

// Searching is UI-specific as of writing.
export type SearchCriteria = {
    searchTerm: string,
};
export type SearchResult = {
    breadcrumbs: string[],
    summaryText: string,
    blockId: string,
    block: Block,
}