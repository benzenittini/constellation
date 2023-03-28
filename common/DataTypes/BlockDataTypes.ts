import { BoundingBox, TypedMap } from "./GenericDataTypes";

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
    // TODO-const
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