

// ==========
// View Types
// ----------

import { DateTime } from "./FieldDataTypes";

export enum ViewType {
    FILTER = 'FILTER',
    KANBAN = 'KANBAN',
    CALENDAR = 'CALENDAR',
};
export interface BaseViewConfig {
    id: string;
    name: string;
    type: ViewType;
    filter: FilterChain;
}
export interface FilterViewConfig extends BaseViewConfig {
}
export interface KanbanViewConfig extends BaseViewConfig {
    groupingFieldId: string,
}
export interface CalendarViewConfig extends BaseViewConfig {
    // TODO-calendar
}
export type ViewConfig = FilterViewConfig | KanbanViewConfig | CalendarViewConfig;


// ============
// Filter Types
// ------------

// -- Enums --
export enum Conjunction { AND = 'AND', OR = 'OR' }
export enum Inclusion { INCLUDE = 'INCLUDE', EXCLUDE = 'EXCLUDE' }
export enum FilterType {
    CLASSIFICATION_EXISTENCE = 'CLASSIFICATION_EXISTENCE',
    FIELD_VALUE  = 'FIELD_VALUE',
    SUMMARY_TEXT = 'SUMMARY_TEXT',
};
export enum StringComparator { 
    CONTAINS    = 'STRING_CONTAINS',
    EQUALS      = 'STRING_EQUALS',
    STARTS_WITH = 'STRING_STARTS_WITH',
    ENDS_WITH   = 'STRING_ENDS_WITH',
}
export enum SingleSelectComparator {
    EQUALS       = 'SS_EQUALS',
    DOESNT_EQUAL = 'SS_DOESNT_EQUAL',
};
export enum MultiSelectComparator { 
    ANY_ONE_OF = 'MS_ANY_ONE_OF',
    ALL_OF     = 'MS_ALL_OF',
    NONE_OF    = 'MS_NONE_OF',
};
export enum TemporalComparator {
    BEFORE        = 'TEMPORAL_BEFORE',
    AFTER         = 'TEMPORAL_AFTER',
    WITHIN_NEXT_X = 'TEMPORAL_WITHIN_NEXT_X',
};

// -- Types --
export type FilterChain = {
    filters: Filter[];
    conjunction: Conjunction;
};
export type Filter = ClassificationFilter | FieldValueFilter | SummaryTextFilter;
export type ClassificationFilter = {
    type: FilterType.CLASSIFICATION_EXISTENCE;
    includeExclude: Inclusion;
    classificationId: string;
};
export type TemporalWithinFilter      = { quantity: number, unit: TemporalUnit };
export type TemporalBeforeAfterFilter = { datetime: DateTime };
export type TemporalFilterValue = TemporalWithinFilter | TemporalBeforeAfterFilter;
export type FieldValueFilter = {
    type: FilterType.FIELD_VALUE;
    fieldId: string;
    comparator: Comparator | null;
    value: string | string[] | null | TemporalFilterValue;
};
export type SummaryTextFilter = {
    type: FilterType.SUMMARY_TEXT;
    comparator: StringComparator;
    value: string;
};
export type Comparator = StringComparator | SingleSelectComparator | MultiSelectComparator | TemporalComparator;
export enum TemporalUnit {
    MINUTE = "MINUTE",
    HOUR   = "HOUR",
    DAY    = "DAY",
    MONTH  = "MONTH",
    YEAR   = "YEAR",
};