
import { Block, BlockContent, BlockIdAndPosition } from "./BlockDataTypes";
import { BasicBoardData, BasicProjectData, BoardData, BoardTemplateClient, TemplateClassification } from "./BoardDataTypes";
import { ChangedFieldValue, ClassificationDefinition, FieldDefinition, PossibleValueDefinition } from "./FieldDataTypes";
import { BoundingBox, TypedMap } from "./GenericDataTypes";
import { BaseViewConfig, ViewConfig } from "./ViewDataTypes";
import { RemoteProject } from "./FileDataTypes";
import { SUPPORT_EMAIL } from "../Constants";


// ==============
// Error Handling
// --------------

export const GENERIC_RESTART = `Try restarting your app, and if that doesn't resolve the issue, reach out to ${SUPPORT_EMAIL} for support.`;

// ErrorCode 1 = auth error
// ErrorCode 2 = unknown error
// ErrorCode n = specific to the request
export type ErrorResponse = { errorCode: number, message?: string };
export type BackendError  = { serverMessage: string, clientResponse: { errorCode: number, message?: string } };

export class ConstError extends Error {

    public readonly clientCode: number;
    public readonly clientMessage: string | undefined;
    public readonly serverMessage: string;

    constructor(clientCode: number, clientMessage: string | undefined, lineId: string, serverMessage: string, wrappedError: any | undefined = undefined) {
        let wrappedServerMessage = serverMessage;
        if (wrappedError) {
            wrappedServerMessage += (wrappedError instanceof Error)
                ? `\nWrapped Error:\n${wrappedError.stack}\n--\n`
                : `\nWrapped Error:\n${wrappedError}\n--\n`;
        }

        super(`${wrappedServerMessage} (${lineId})`);

        this.clientCode = clientCode;
        this.clientMessage = clientMessage;
        this.serverMessage = wrappedServerMessage;
    }

    getErrorResponse(): ErrorResponse {
        return {
            errorCode: this.clientCode,
            message: this.clientMessage,
        };
    }

    static safeConstructor(error: Error | ConstError): ConstError {
        return (error instanceof ConstError)
            ? error
            : new ConstError(2, undefined,
                ConstError.getLineId('ActionDataTypes', 'safeConstructor', 1),
                'An unhandled error has occurred.',
                error);
    }

    static getLineId(file: string, func: string, occurrence: number) {
        return `${file}.${func}:${occurrence}`;
    }
}


// ================
// Project Requests
// ----------------

export type GetProjectDataRequest = void;
export type GetProjectDataResponse = ErrorResponse | BasicProjectData;

export type GetBoardTemplatesRequest = void;
export type GetBoardTemplatesResponse = ErrorResponse | BoardTemplateClient[];

export type CreateNewBoardRequest = { boardOrFileName: string, template: TemplateClassification[] };
// Error 3 indicates a required parameter was missing/empty.
export type CreateNewBoardResponse = ErrorResponse | BasicBoardData;

export type DeleteBoardRequest = { boardId: string, deleteFile?: boolean };
export type DeleteBoardResponse = ErrorResponse | { boardId: string, projectId: string };

export type BoardConfig = { name: string };
export type UpdateBoardConfigRequest = { boardConfig: BoardConfig };
export type UpdateBoardConfigResponse = ErrorResponse | { projectId: string, boardId: string, boardConfig: BoardConfig };

export type GetRemoteProjectsRequest = void;
export type GetRemoteProjectsResponse = ErrorResponse | RemoteProject[];

export type ImportBoardRequest = undefined | { boardName: string, initialData: BoardData };
// Error 3 indicates file selection was cancelled.
// Error 4 indicates failed to parse file
// Error 5 indicates file wasn't of type BoardData
// Error 6 indicates file already exists
export type ImportBoardResponse = ErrorResponse | BasicBoardData;
export type ReadFileAsBoardResponse = ErrorResponse | { filepath: string, filename: string, boardData: BoardData };

// JoinProjectAction (Server)
export type JoinProjectRequest = { registrationKey: string, clientName: string };
// Error 3 indicates a REST error (probably bad URL)
export type JoinProjectResponse = ErrorResponse | { token: string };
// JoinProjectAction (Client)
export type AddRemoteProjectRequest = { serverUrl: string, credentials: string };
export type AddRemoteProjectResponse = ErrorResponse | {};

// LeaveProjectAction (Server)
export type LeaveProjectRequest = void;
export type LeaveProjectResponse = {}; // If user fails to "leave" server-side, we ignore the error on the client and proceed happily.
// LeaveProjectAction (Client)
export type RemoveRemoteProjectRequest = { remoteProject: RemoteProject};
export type RemoveRemoteProjectResponse = ErrorResponse | {};


// ==============
// Board Requests
// --------------

export type GetBoardDataRequest  = { boardId: string };
// Error 3 indicates error loading/parsing the file.
// Error 4 indicates file not found.
export type GetBoardDataResponse = ErrorResponse | BoardData;

export type CreateBlockRequest  = { location: BoundingBox, parentBlockId: string | undefined };
// Error 3 indicates parent block not found.
// Error 4 indicates block ID already exists.
export type CreateBlockResponse = ErrorResponse | Block;

export type SetBlockPositionsRequest  = { blocksAndPositions: BlockIdAndPosition[] };
export type SetBlockPositionsResponse = ErrorResponse | BlockIdAndPosition[];

export type DeleteBlocksRequest  = { blockIds: string[] };
export type DeleteBlocksResponse = ErrorResponse | { blockIds: string[] };

export type SetBlockParentRequest  = { blockId: string, parentBlockId: string | undefined };
// Error 3 indicates blockId was undefined
// Error 4 indicates block wasn't found
// Error 5 indicates parentBlockId doesn't exist
// Error 6 indicates a circular dependency was detected
export type SetBlockParentResponse = ErrorResponse | { blockId: string, parentBlockId: string | undefined };

export type SetBlockContentRequest  = { blockId: string, content: BlockContent };
// Error 3 indicates block wasn't found
export type SetBlockContentResponse = ErrorResponse | { blockId: string, content: BlockContent };

export type SetClassificationDefinitionsRequest  = { classificationIds: string[], classifications: TypedMap<ClassificationDefinition>, fields: TypedMap<FieldDefinition>, possibleValues: TypedMap<PossibleValueDefinition> };
// Error 3 indicates changing between incompatible field types
// Error 4 indicates possible value wasn't associated with a field.
export type SetClassificationDefinitionsResponse = ErrorResponse | { classificationIds: string[], classifications: TypedMap<ClassificationDefinition>, fields: TypedMap<FieldDefinition>, possibleValues: TypedMap<PossibleValueDefinition>, changedFieldValues: ChangedFieldValue[]};

export type SetClassificationOnBlocksRequest  = { blockIds: string[], classificationId: string, isActive: boolean };
// Error 3 indicates block wasn't found
// Error 4 indicates classification wasn't found
export type SetClassificationOnBlocksResponse = ErrorResponse | { blockIds: string[], classificationId: string, isActive: boolean };

export type SetFieldDefinitionsRequest  = { blockIds: string[], fieldDefinitions: TypedMap<FieldDefinition>, fieldIds: string[], possibleValueDefinitions: TypedMap<PossibleValueDefinition>, deletedFieldIds: string[] };
// Error 3 indicates changing between incompatible field types
// Error 4 indicates possible value wasn't associated with a field.
// Error 5 indicates block wasn't found when deleting fields
// Error 6 indicates block wasn't found when adding fields
export type SetFieldDefinitionsResponse = ErrorResponse | {
    fieldDefinitions: TypedMap<FieldDefinition>;
    possibleValueDefinitions: TypedMap<PossibleValueDefinition>;
    blockFieldIds: TypedMap<string[]>; // Block ID --> fieldIds[] on that block

    // When possible values are renamed, blocks with that value are updated too.
    changedFieldValues: ChangedFieldValue[];
};

export type SetFieldOnBlocksRequest  = { fieldId: string, blockIdToFieldValue: TypedMap<any> };
// Error 5 indicates block wasn't found
export type SetFieldOnBlocksResponse = ErrorResponse | { fieldId: string, blockIdToFieldValue: TypedMap<any> };

export type SaveViewRequest  = { viewConfig: ViewConfig };
export type SaveViewResponse = ErrorResponse | { baseViewConfig: BaseViewConfig };

export type DeleteViewRequest  = { viewId: string };
export type DeleteViewResponse = ErrorResponse | { viewId: string };

export type SetBlockPriorityRequest  = { blockId: string[], beforeId: string | undefined };
// Error 3 indicates the "beforeId" block wasn't found in the priority list
export type SetBlockPriorityResponse = ErrorResponse | { blockId: string[], beforeId: string | undefined };

export type LoadViewRequest  = { viewId: string };
export type LoadViewResponse = ErrorResponse | { viewConfig: ViewConfig };