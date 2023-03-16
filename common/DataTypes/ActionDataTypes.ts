
import { Block, BlockContent, BlockIdAndPosition } from "./BlockDataTypes";
import { BasicBoardData, BasicProjectData, BoardData, BoardTemplateClient, TemplateClassification } from "./BoardDataTypes";
import { ChangedFieldValue, ClassificationDefinition, FieldDefinition, PossibleValueDefinition } from "./FieldDataTypes";
import { BoundingBox, TypedMap } from "./GenericDataTypes";
import { BaseViewConfig, ViewConfig } from "./ViewDataTypes";
import { RemoteProject } from "./FileDataTypes";

// ErrorCode 1 = auth error
// ErrorCode 2 = unknown error
// ErrorCode n = specific to the request
export type ErrorResponse = { errorCode: number, message?: string };

// ================
// Project Requests
// ----------------

export type GetProjectDataRequest = void;
export type GetProjectDataResponse = ErrorResponse | BasicProjectData;

export type GetBoardTemplatesRequest = void;
export type GetBoardTemplatesResponse = ErrorResponse | BoardTemplateClient[];

export type CreateNewBoardRequest = { boardOrFileName: string, template: TemplateClassification[] };
export type CreateNewBoardResponse = ErrorResponse | BasicBoardData;

export type DeleteBoardRequest = { boardId: string, deleteFile?: boolean };
export type DeleteBoardResponse = ErrorResponse | { boardId: string, projectId: string };

export type BoardConfig = { name: string };
export type UpdateBoardConfigRequest = { boardConfig: BoardConfig };
export type UpdateBoardConfigResponse = ErrorResponse | { projectId: string, boardId: string, boardConfig: BoardConfig };

export type GetRemoteProjectsRequest = void;
export type GetRemoteProjectsResponse = ErrorResponse | RemoteProject[];

// TODO-const : I AM HERE FOR RESPONSE ERRORS
export type ImportBoardRequest = undefined | { boardName: string, initialData: BoardData };
export type ImportBoardResponse = BasicBoardData | undefined;
export type ReadFileAsBoardResponse = { filepath?: string, filename?: string, boardData?: BoardData };

export type JoinProjectRequest = { registrationKey: string, clientName: string };
export type JoinProjectResponse = { token: string };

export type LeaveProjectRequest = void;
export type LeaveProjectResponse = {};

export type AddRemoteProjectRequest = { serverUrl: string, credentials: string };
export type AddRemoteProjectResponse = void;

export type RemoveRemoteProjectRequest = { remoteProject: RemoteProject};
export type RemoveRemoteProjectResponse = void;


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

export type SetFieldDefinitionsRequest  = { blockIds: string[], fieldDefinitions: TypedMap<FieldDefinition>, fieldIds: string[], possibleValueDefinitions: TypedMap<PossibleValueDefinition>, deletedFieldIds: string[] };
export type SetFieldDefinitionsResponse = {
    fieldDefinitions: TypedMap<FieldDefinition>;
    possibleValueDefinitions: TypedMap<PossibleValueDefinition>;
    blockFieldIds: TypedMap<string[]>; // Block ID --> fieldIds[] on that block

    // When possible values are renamed, blocks with that value are updated too.
    changedFieldValues: ChangedFieldValue[];
};

export type SetFieldOnBlocksRequest  = { fieldId: string, blockIdToFieldValue: TypedMap<any> };
export type SetFieldOnBlocksResponse = { fieldId: string, blockIdToFieldValue: TypedMap<any> };

export type SaveViewRequest  = { viewConfig: ViewConfig };
export type SaveViewResponse = { baseViewConfig: BaseViewConfig };

export type DeleteViewRequest  = { viewId: string };
export type DeleteViewResponse = { viewId: string };

export type SetBlockPriorityRequest  = { blockId: string[], beforeId: string | undefined };
export type SetBlockPriorityResponse = { blockId: string[], beforeId: string | undefined };

export type LoadViewRequest  = { viewId: string };
export type LoadViewResponse = { viewConfig: ViewConfig };