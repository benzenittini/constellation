
export enum DataType {
    TEXT = "Text",
    SINGLE_SELECT = "Single-Select",
    MULTI_SELECT = "Multi-Select",
    TEMPORAL = "Temporal",
}
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

// Keep in sync with FieldDataTypes.getCompatibleFieldTypes
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

export interface PossibleValueDefinition {
    id: string;
    name: string;
    style?: {
        'border'? : string,
        'background'? : string,
        'text'? : string,
    };
}

export function verifyPossibleValueDefinition(data: any): data is PossibleValueDefinition {
    // TODO-const
    return true;
}

export interface FieldDefinition {
    id: string;
    name: string;
    type: FieldType;
    possibleValueIds: string[];
    sourceType: 'block' | 'classification';
}

export function verifyFieldDefinition(data: any): data is FieldDefinition {
    // TODO-const
    return true;
}

export interface ClassificationDefinition {
    id: string;
    name: string;
    fieldIds: string[];
}

export function verifyClassificationDefinition(data: any): data is ClassificationDefinition {
    // TODO-const
    return true;
}

export interface ChangedPVName {
    pvId: string,
    oldName: string,
    newName: string,
}
export interface ChangedFieldValue {
    blockId: string;
    fieldId: string;
    newValue: any;
}

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