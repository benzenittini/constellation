
import { AugmentedActionContext, GetterProperties, RootState, TypedMap } from "../StoreTypes"


// -- State --
export interface FieldDataState {
    classificationIds: string[],
    classificationDefinitions: TypedMap<ClassificationDefinition>,
    fieldDefinitions: TypedMap<FieldDefinition>,
    possibleValueDefinitions: TypedMap<PossibleValueDefinition>,
}

// -- Mutations --
export type FieldDataMutations<S = FieldDataState> = {
    resetStore      (state: S): void;
    clearBoardState (state: S): void;

    setClassifications   (state: S, payload: {classificationDefinitions: TypedMap<ClassificationDefinition>, classificationIds: string[]}): void;

    setFields   (state: S, fields: TypedMap<FieldDefinition>): void;
    addField    (state: S, field: FieldDefinition): void;
    removeField (state: S, fieldId: string): void;

    setPossibleValues   (state: S, possibleValues: TypedMap<PossibleValueDefinition>): void;
    addPossibleValue    (state: S, possibleValue: PossibleValueDefinition): void;
    removePossibleValue (state: S, possibleValueId: string): void;
}

// -- Actions --
export interface FieldDataActions {
    resetStore      ({ commit }: AugmentedActionContext<FieldDataState>): void;
    clearBoardState ({ commit }: AugmentedActionContext<FieldDataState>): void;

    setClassificationDefinitions ({ commit }: AugmentedActionContext<FieldDataState>, classificationsWithOrdering: { classificationDefinitions: TypedMap<ClassificationDefinition>, classificationIds: string[] }): void;
    setFieldDefinitions          ({ commit }: AugmentedActionContext<FieldDataState>, fields: TypedMap<FieldDefinition>): void;
    setPossibleValueDefinitions  ({ commit }: AugmentedActionContext<FieldDataState>, possibleValues: TypedMap<PossibleValueDefinition>): void;
}

// -- Getters --
export type FieldDataGetters<S = FieldDataState> = {
    classificationIds         (state: S): string[];
    classifications           (state: S): TypedMap<ClassificationDefinition>;
    fields                    (state: S): TypedMap<FieldDefinition>;
    possibleValues            (state: S): TypedMap<PossibleValueDefinition>;
    boardColors               (state: S): string[];
    fieldIdToClassificationId (state: S): TypedMap<string>;

    getChangedFieldValues (state: S, getters: GetterProperties, rootState: RootState): (newPVDefs: TypedMap<PossibleValueDefinition>) => { entityId: string, fieldId: string, newValue: any }[];
}


// =============
// Generic Types
// -------------

// TODO-later : ...change these to have an "id" and a display name..?
// Keep in sync with AppDataInterface.FieldType
export enum FieldType {
    TEXTBOX = "Textbox",
    TEXT_EDITOR = "Text Editor", // "Markdown Editor"
    DROPDOWN = "Dropdown",
    RADIO_BUTTONS = "Radio Buttons",
    CHECKBOXES = "Checkboxes",
    DATE = "Date",
    TIME = "Time",
    DATETIME = "Date and Time",
}

export type DateTime = {
    date: string,
    time: string,
};
export type DropdownOption = { display: string, value: string, disabled?: boolean, group?: string };

export function getAllFieldTypes(): FieldType[] {
    return [
        // Text
        FieldType.TEXTBOX,
        FieldType.TEXT_EDITOR,
        // Single-Select
        FieldType.DROPDOWN,
        FieldType.RADIO_BUTTONS,
        // Multi-Select
        FieldType.CHECKBOXES,
        // Temporal
        FieldType.DATE,
        FieldType.TIME,
        FieldType.DATETIME,
    ];
}

export enum DataType {
    TEXT = "Text",
    SINGLE_SELECT = "Single-Select",
    MULTI_SELECT = "Multi-Select",
    TEMPORAL = "Temporal",
}

// Keep in sync with AppDataInterface.getCompatibleFieldTypes
export function getCompatibleFieldTypes(fieldType: FieldType): FieldType[] {
    switch (fieldType) {
        // Text Fields
        case FieldType.TEXTBOX:
        case FieldType.TEXT_EDITOR:
            return [ FieldType.TEXTBOX, FieldType.TEXT_EDITOR ];

        // Single-Select Fields
        case FieldType.DROPDOWN:
        case FieldType.RADIO_BUTTONS:
            return [ FieldType.DROPDOWN, FieldType.RADIO_BUTTONS ];

        // Multi-Select Fields
        case FieldType.CHECKBOXES:
            return [ FieldType.CHECKBOXES ];
        
        // Temporal Fields
        case FieldType.DATE:
        case FieldType.TIME:
        case FieldType.DATETIME:
            return [ FieldType.DATE, FieldType.TIME, FieldType.DATETIME ];
    }
}
export function getFieldDataType(fieldType: FieldType): DataType {
    switch (fieldType) {
        // Text Fields
        case FieldType.TEXTBOX:
        case FieldType.TEXT_EDITOR:
            return DataType.TEXT;

        // Single-Select Fields
        case FieldType.DROPDOWN:
        case FieldType.RADIO_BUTTONS:
            return DataType.SINGLE_SELECT;

        // Multi-Select Fields
        case FieldType.CHECKBOXES:
            return DataType.MULTI_SELECT;

        // Temporal Fields
        case FieldType.DATE:
        case FieldType.TIME:
        case FieldType.DATETIME:
            return DataType.TEMPORAL;
    }
}

export function fieldTypeHasPVs(fieldType: FieldType) {
    return [
        FieldType.DROPDOWN,
        FieldType.CHECKBOXES,
        FieldType.RADIO_BUTTONS
    ].includes(fieldType);
}
export function getFieldValue(fieldType: FieldType, value: any) {
    // We might need to convert the value if the field type was recently changed, or
    // populate an empty value if none exists.

    // TODO-later : now that we're no longer allowing users to change between any two
    // field types, we might be able to greatly simplify this logic.

    if (fieldType === FieldType.CHECKBOXES) {
        // If FieldType is a checkbox, then make sure "value" is returned as an array.
        if (value === undefined || value === null) {
            return [];
        } else if (Array.isArray(value)) {
            return value;
        } else {
            return [value];
        }
    } else if (getFieldDataType(fieldType) === DataType.TEMPORAL) {
        // Temporal fields should be returned as an object with both a 'date' and 'time' field.
        if (value === undefined || value === null) {
            return { date: '', time: '' };
        } else {
            return value;
        }
    } else {
        // Otherwise, make sure "value" is returned as a single string or null value.
        if (value === undefined || value === null) {
            return null;
        } else if (Array.isArray(value)) {
            return JSON.stringify(value);
        } else {
            return value;
        }
    }
}
export type MappableLabelComponentData = {
    modelValue?: any,
    mapFunction?: (modelValue: any) => string,
    isValid?: (modelValue: any) => boolean,
};
export type TextboxComponentData = {
    modelValue?: string,
    eicPlaceholder?: string,
    eicIsPassword?: boolean,
    isValid?: (modelValue: any) => boolean,
};
export type DropdownComponentData = {
    modelValue?: string,
    eicOptions?: { display: string, value: string }[],
    isValid?: (modelValue: any) => boolean,
};
export type CheckboxComponentData = {
    modelValue?: boolean,
    eicLabel?: string,
    isValid?: (modelValue: any) => boolean,
};
export type RadioButtonComponentData = {
    modelValue?: string,
    eicGroup?: string,
    eicLabel?: string,
    eicRadioValue?: string,
    isValid?: (modelValue: any) => boolean,
};
export type TextEditorComponentData = {
    modelValue?: string,
    isValid?: (modelValue: any) => boolean,
};
export type ConfigurableInputComponentData = {
    modelValue?: PossibleValueDefinition[],
    eicPlaceholder?: string,
    getDisplayedValue?: ((modelValue: any) => any),
    isValid?: (modelValue: any) => boolean,
    eicDialogData?: { id: string },
    eicDialogType?: string,
};
export type ComponentData = MappableLabelComponentData | TextboxComponentData | DropdownComponentData | CheckboxComponentData | RadioButtonComponentData | TextEditorComponentData | ConfigurableInputComponentData;

export interface PossibleValueDefinition {
    id: string;
    name: string;
    style?: {
        'border'? : string,
        'background'? : string,
        'text'? : string,
    };
}

export interface FieldDefinition {
    id: string;
    name: string;
    type: FieldType;
    possibleValueIds: string[];
    sourceType: 'entity' | 'classification';
}

export interface ClassificationDefinition {
    id: string,
    name: string,
    fieldIds: string[],
}


// ========================
// Built-In Board Templates
// ------------------------

// =============================================
// !!! Keep these in sync with WebDataInterface!
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
};
// =============================================

export const BUILT_IN = 'Built-In';
export const BUILT_IN_TEMPLATES: BoardTemplateClient[] = [
    {
        projectId: BUILT_IN,
        boardId: 'Project Management',
        projectName: BUILT_IN,
        boardName: 'Project Management',
        classifications: [{
            name: 'Task',
            fields: [{
                name: 'Status',
                type: FieldType.DROPDOWN,
                possibleValues: [
                    { name: 'Needs Planned',  style: { border: '#FF5855' } },
                    { name: 'Ready for Work', style: { border: '#FF9D54' } },
                    { name: 'In Progress',    style: { border: '#FFF153' } },
                    { name: 'Under Review',   style: { border: '#52BEFF' } },
                    { name: 'Done',           style: { border: '#51FF64' } },
                ],
                sourceType: 'classification',
            },{
                name: 'Assignee',
                type: FieldType.DROPDOWN,
                possibleValues: [
                    { name: 'Jim'  },
                    { name: 'Kate' },
                    { name: 'Dave' },
                ],
                sourceType: 'classification',
            },{
                name: 'Due Date',
                type: FieldType.DATE,
                possibleValues: [],
                sourceType: 'classification',
            },{
                name: 'Description',
                type: FieldType.TEXT_EDITOR,
                possibleValues: [],
                sourceType: 'classification',
            },{
                name: 'Flags',
                type: FieldType.CHECKBOXES,
                possibleValues: [
                    { name: 'Quick Fix',      style: { text: '#51FF64' } },
                    { name: 'High Priority',  style: { text: '#FF5855' } },
                ],
                sourceType: 'classification',
            }]
        },{
            name: 'Person',
            fields: [{
                name: 'Email',
                type: FieldType.TEXTBOX,
                possibleValues: [],
                sourceType: 'classification',
            },{
                name: 'Phone',
                type: FieldType.TEXTBOX,
                possibleValues: [],
                sourceType: 'classification',
            },{
                name: 'Type',
                type: FieldType.DROPDOWN,
                possibleValues: [
                    { name: 'Internal', style: { background: '#1C1339' } },
                    { name: 'External', style: { background: '#391313' } },
                ],
                sourceType: 'classification',
            }]
        }],
    },{
        projectId: BUILT_IN,
        boardId: 'Course Organization',
        projectName: BUILT_IN,
        boardName: 'Course Organization',
        classifications: [{
            name: 'Assignment',
            fields: [{
                name: 'Status',
                type: FieldType.DROPDOWN,
                possibleValues: [
                    { name: 'Needs Planned',  style: { border: '#FF5855' } },
                    { name: 'Ready for Work', style: { border: '#FF9D54' } },
                    { name: 'In Progress',    style: { border: '#FFF153' } },
                    { name: 'Under Review',   style: { border: '#52BEFF' } },
                    { name: 'Done',           style: { border: '#51FF64' } },
                ],
                sourceType: 'classification',
            },{
                name: 'Due Date',
                type: FieldType.DATE,
                possibleValues: [],
                sourceType: 'classification',
            },{
                name: 'Description',
                type: FieldType.TEXT_EDITOR,
                possibleValues: [],
                sourceType: 'classification',
            }],
        },{
            name: 'Course',
            fields: [{
                name: 'Room',
                type: FieldType.TEXTBOX,
                possibleValues: [],
                sourceType: 'classification',
            },{
                name: 'Schedule',
                type: FieldType.TEXT_EDITOR,
                possibleValues: [],
                sourceType: 'classification',
            }]
        },{
            name: 'Meeting',
            fields: [{
                name: 'Location',
                type: FieldType.TEXTBOX,
                possibleValues: [],
                sourceType: 'classification',
            },{
                name: 'Time',
                type: FieldType.DATETIME,
                possibleValues: [],
                sourceType: 'classification',
            },{
                name: 'Notes',
                type: FieldType.TEXT_EDITOR,
                possibleValues: [],
                sourceType: 'classification',
            },{
                name: 'Type',
                type: FieldType.DROPDOWN,
                possibleValues: [
                    { name: 'General',     style: { background: '#131439' } },
                    { name: 'Test / Quiz', style: { background: '#391313' } },
                ],
                sourceType: 'classification',
            }]
        },{
            name: 'For the Class...',
            fields: [{
                name: 'Class',
                type: FieldType.DROPDOWN,
                possibleValues: [
                    { name: 'MATH 101' },
                    { name: 'CMPSC 101' },
                    { name: 'PSYCH 101' },
                    { name: 'HIST 101' },
                ],
                sourceType: 'classification',
            }]
        },{
            name: 'Bookmarks',
            fields: [{
                name: 'Bookmarks',
                type: FieldType.TEXT_EDITOR,
                possibleValues: [],
                sourceType: 'classification',
            }]
        },{
            name: 'Person',
            fields: [{
                name: 'Email',
                type: FieldType.TEXTBOX,
                possibleValues: [],
                sourceType: 'classification',
            },{
                name: 'Phone',
                type: FieldType.TEXTBOX,
                possibleValues: [],
                sourceType: 'classification',
            },{
                name: 'Type',
                type: FieldType.DROPDOWN,
                possibleValues: [
                    { name: 'Teacher', style: { text: '#C962FF' } },
                    { name: 'TA',      style: { text: '#5CCD56' } },
                    { name: 'Student', style: { text: '#6891FF' } },
                ],
                sourceType: 'classification',
            }]
        }],
    }
]