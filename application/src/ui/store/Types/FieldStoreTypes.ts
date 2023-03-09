
import { BoardTemplateClient } from "../../../../../common/DataTypes/BoardDataTypes";
import { ClassificationDefinition, DataType, FieldDefinition, FieldType, PossibleValueDefinition, getFieldDataType } from "../../../../../common/DataTypes/FieldDataTypes";
import { TypedMap } from "../../../../../common/DataTypes/GenericDataTypes";
import { AugmentedActionContext, GetterProperties, RootState } from "../StoreTypes"


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

    getChangedFieldValues          (state: S, getters: GetterProperties, rootState: RootState): (newPVDefs: TypedMap<PossibleValueDefinition>) => { blockId: string, fieldId: string, newValue: any }[];

    classificationOptions          (state: S, getters: GetterProperties): DropdownOption[];
    classificationFieldPairOptions (state: S, getters: GetterProperties): (filter?: (f: FieldDefinition) => boolean) => DropdownOption[];
    getPossibleValueOptsForField   (state: S, getters: GetterProperties): (fieldId: string) => DropdownOption[];

    getFieldTypeGivenFieldId     (state: S, getters: GetterProperties): (fieldId: string) => FieldType | null;
    getFieldDataTypeGivenFieldId (state: S, getters: GetterProperties): (fieldId: string) => DataType | null;
}


// =============
// Generic Types
// -------------

export type DropdownOption = { display: string, value: string, disabled?: boolean, group?: string };

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



// ========================
// Built-In Board Templates
// ------------------------

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