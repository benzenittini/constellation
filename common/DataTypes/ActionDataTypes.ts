
import { Block, BlockContent, BlockIdAndPosition } from "./BlockDataTypes";
import { BasicBoardData, BasicProjectData, BoardData } from "./BoardDataTypes";
import { ChangedFieldValue, ClassificationDefinition, FieldDefinition, PossibleValueDefinition } from "./FieldDataTypes";
import { BoundingBox, TypedMap } from "./GenericDataTypes";

// ================
// Project Requests
// ----------------

export type GetBoardsForProjectRequest = void;
export type GetBoardsForProjectResponse = BasicBoardData[];

// Only remote boards get a name.
export type CreateNewBoardRequest = void | { boardName?: string };
export type CreateNewBoardResponse = BasicBoardData | undefined;

export type GetRemoteProjectsRequest = void;
export type GetRemoteProjectsResponse = BasicProjectData[];


// ==============
// Board Requests
// --------------

export type GetBoardDataRequest  = { boardId: string };
export type GetBoardDataResponse = BoardData | undefined;

export type CreateBlockRequest  = { location: BoundingBox, parentBlockId: string | undefined };
export type CreateBlockResponse = Block | undefined;

export type SetBlockPositionsRequest  = { blocksAndPositions: BlockIdAndPosition[] };
export type SetBlockPositionsResponse = BlockIdAndPosition[];

export type DeleteBlocksRequest  = { blockIds: string[] };
export type DeleteBlocksResponse = { blockIds: string[] };

export type SetBlockParentRequest  = { blockId: string, parentBlockId: string | undefined };
export type SetBlockParentResponse = { blockId: string, parentBlockId: string | undefined };

export type SetBlockContentRequest  = { blockId: string, content: BlockContent };
export type SetBlockContentResponse = { blockId: string, content: BlockContent };

export type SetClassificationDefinitionsRequest  = { classificationIds: string[], classifications: TypedMap<ClassificationDefinition>, fields: TypedMap<FieldDefinition>, possibleValues: TypedMap<PossibleValueDefinition> };
export type SetClassificationDefinitionsResponse = { classificationIds: string[], classifications: TypedMap<ClassificationDefinition>, fields: TypedMap<FieldDefinition>, possibleValues: TypedMap<PossibleValueDefinition>, changedFieldValues: ChangedFieldValue[]};

export type SetClassificationOnBlocksRequest  = { blockIds: string[], classificationId: string, isActive: boolean };
export type SetClassificationOnBlocksResponse = { blockIds: string[], classificationId: string, isActive: boolean };