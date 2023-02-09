
import { AugmentedActionContext, GetterProperties, RootState, TypedMap } from "../StoreTypes";
import { Entity } from "./EntityDataTypes";
import { DateTime, PossibleValueDefinition } from "./FieldDataTypes";
import * as StringUtils from '../../utilities/StringUtils';
import * as DateUtils from '../../utilities/DateUtils';
import * as ErrorLogger from '../../utilities/ErrorLogger';


// -- State --
export interface ViewDataState {
    availableViews: TypedMap<BaseViewConfig>;
    activeViewConfig: ViewConfig | undefined;
}

// -- Mutations --
export type ViewDataMutations<S = ViewDataState> = {
    resetStore      (state: S): void;
    clearBoardState (state: S): void;

    // View Crud
    setAvailableViews(state: S, views: TypedMap<BaseViewConfig>): void;
    addAvailableView(state: S, view: BaseViewConfig): void;
    removeAvailableView(state: S, viewId: string): void;
    setActiveView(state: S, view: ViewConfig): void;
    clearActiveView(state: S): void;
}

// -- Actions --
export interface ViewDataActions {
    resetStore      ({ commit }: AugmentedActionContext<ViewDataState>): void;
    clearBoardState ({ commit }: AugmentedActionContext<ViewDataState>): void;

    // View Crud
    setAvailableViews({ commit }: AugmentedActionContext<ViewDataState>, views: TypedMap<BaseViewConfig>): void;
    addView({ commit }: AugmentedActionContext<ViewDataState>, view: BaseViewConfig): void;
    deleteView({ commit }: AugmentedActionContext<ViewDataState>, viewId: string): void;
    openView({ commit }: AugmentedActionContext<ViewDataState>, view: ViewConfig): void;
    closeView({ commit }: AugmentedActionContext<ViewDataState>): void;
}

// -- Getters --
export type ViewDataGetters<S = ViewDataState> = {
    displayedBlocks    (state: S, getters: GetterProperties, rootState: RootState): Entity[];
    relevantPriorities (state: S, getters: GetterProperties, rootState: RootState): string[];
    prioritizedBlocks  (state: S, getters: GetterProperties, rootState: RootState): Entity[];
}


// ==========
// View Types
// ----------

// Keep these in sync with types/interfaces in AppDataInterface!
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

export function isValidConfig(viewConfig: ViewConfig): boolean {
    // Must have a non-blank name
    if (viewConfig.name.trim().length === 0) {
        ErrorLogger.showError('3.3.1');
        return false;
    }

    if (viewConfig.type === ViewType.KANBAN) {
        // Kanbans must have a groupingFieldId
        if (!('groupingFieldId' in viewConfig)) {
            ErrorLogger.showError('3.3.2');
            return false;
        }
    }

    return true;
}


// ============
// Filter Types
// ------------

// Keep these in sync with types/interfaces in AppDataInterface!

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
export enum TemporalUnit {
    MINUTE = "MINUTE",
    HOUR   = "HOUR",
    DAY    = "DAY",
    MONTH  = "MONTH",
    YEAR   = "YEAR",
};
// Certain filter checks only need to be done for the "inclusive" comparators, not the "exclusive" comparators.
const EXCLUSIVE_COMPARATORS: Comparator[] = [
    MultiSelectComparator.NONE_OF,
];

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

export type TemporalWithinFilter      = { quantity: number, unit: TemporalUnit };
export type TemporalBeforeAfterFilter = { datetime: DateTime };
export type TemporalFilterValue = TemporalWithinFilter | TemporalBeforeAfterFilter;

// -- Dropdown Options --
export const CONJUNCTION_OPTS: { value: Conjunction, display: string }[] = [
    { value: Conjunction.AND, display: 'And' },
    { value: Conjunction.OR,  display: 'Or' },
];
export const INCLUSION_OPTS: { value: Inclusion, display: string }[] = [
    { value: Inclusion.INCLUDE, display: 'Include' },
    { value: Inclusion.EXCLUDE, display: 'Exclude' },
];
export const FILTER_TYPE_OPTS: { value: FilterType, display: string }[] = [
    { value: FilterType.CLASSIFICATION_EXISTENCE, display: 'Check for Classification' },
    { value: FilterType.FIELD_VALUE,              display: 'Check for Field Value' },
    { value: FilterType.SUMMARY_TEXT,             display: 'Check for Summary Text' },
];
export const STRING_COMPARATOR_OPTS: { value: StringComparator, display: string }[] = [
    { value: StringComparator.CONTAINS,    display: 'contains' },
    { value: StringComparator.EQUALS,      display: 'equals' },
    { value: StringComparator.STARTS_WITH, display: 'starts with' },
    { value: StringComparator.ENDS_WITH,   display: 'ends with' },
];
export const SINGLE_SELECT_COMPARATOR_OPTS: { value: SingleSelectComparator, display: string }[] = [
    { value: SingleSelectComparator.EQUALS,       display: 'equals' },
    { value: SingleSelectComparator.DOESNT_EQUAL, display: 'does not equal' },
];
export const MULTI_SELECT_COMPARATOR_OPTS: { value: MultiSelectComparator, display: string }[] = [
    { value: MultiSelectComparator.ANY_ONE_OF, display: 'has any one of' },
    { value: MultiSelectComparator.ALL_OF,     display: 'has all of' },
    { value: MultiSelectComparator.NONE_OF,    display: 'has none of' },
];
export const TEMPORAL_COMPARATOR_OPTS: { value: TemporalComparator, display: string }[] = [
    { value: TemporalComparator.BEFORE,        display: 'before' },
    { value: TemporalComparator.AFTER,         display: 'after' },
    { value: TemporalComparator.WITHIN_NEXT_X, display: 'within the next' },
];

export const TEMPORAL_UNIT_OPTS: { value: TemporalUnit, display: string }[] = [
    { value: TemporalUnit.MINUTE, display: 'minutes' },
    { value: TemporalUnit.HOUR,   display: 'hours' },
    { value: TemporalUnit.DAY,    display: 'days' },
    { value: TemporalUnit.MONTH,  display: 'months' },
    { value: TemporalUnit.YEAR,   display: 'years' },
];

function passesComparator(blockVal: string | string[] | DateTime, ruleVal: string | string[] | TemporalFilterValue, comparator: Comparator): boolean {
    switch (comparator) {
        // String Comparisons
        case StringComparator.CONTAINS:
            return (blockVal as string).toUpperCase().includes((ruleVal as string).toUpperCase());
        case StringComparator.EQUALS:
            return blockVal === ruleVal;
        case StringComparator.STARTS_WITH:
            return (blockVal as string).toUpperCase().startsWith((ruleVal as string).toUpperCase());
        case StringComparator.ENDS_WITH:
            return (blockVal as string).toUpperCase().endsWith((ruleVal as string).toUpperCase());

        // Single-Select Comparisons
        case SingleSelectComparator.EQUALS:
            return blockVal === ruleVal;
        case SingleSelectComparator.DOESNT_EQUAL:
            return blockVal !== ruleVal;

        // Multi-Select Comparisons
        case MultiSelectComparator.ALL_OF:
            return (ruleVal as string[]).every(val => (blockVal as string[])?.includes(val));
        case MultiSelectComparator.ANY_ONE_OF:
            return (ruleVal as string[]).some(val => (blockVal as string[])?.includes(val));
        case MultiSelectComparator.NONE_OF:
            return !(ruleVal as string[]).some(val => (blockVal as string[])?.includes(val));

        // Temporal Comparators
        case TemporalComparator.BEFORE:
            return (DateUtils.datetimeToMS(blockVal as DateTime) < DateUtils.datetimeToMS((ruleVal as TemporalBeforeAfterFilter).datetime))
        case TemporalComparator.AFTER:
            return (DateUtils.datetimeToMS(blockVal as DateTime) > DateUtils.datetimeToMS((ruleVal as TemporalBeforeAfterFilter).datetime))
        case TemporalComparator.WITHIN_NEXT_X:
            let {quantity, unit} = (ruleVal as TemporalWithinFilter);
            let upperBound = getMultiplier(unit) * quantity + Date.now();
            let blockDT = blockVal as DateTime;
            // If both the date and time are blank, then this shouldn't be under consideration.
            // Without this, when parsing, we assume "today" if the date is blank, which causes probs.
            if (!blockDT.date && !blockDT.time) return false;
            let blockMillis = DateUtils.datetimeToMS(blockDT);
            return blockMillis < upperBound;
    }

    // Shouldn't ever arrive here ... but in case we do, omit the result:
    return false;
}
function getMultiplier(unit: TemporalUnit): number {
    switch (unit) {
        case TemporalUnit.MINUTE: return 1000*60;
        case TemporalUnit.HOUR:   return 1000*60*60;
        case TemporalUnit.DAY:    return 1000*60*60*24;
        case TemporalUnit.MONTH:  return 1000*60*60*24*30;
        case TemporalUnit.YEAR:   return 1000*60*60*24*30*12;
    }
}

export function passesFilter(block: Entity, filter: Filter, pvLookups: TypedMap<PossibleValueDefinition>, fieldIdToClassificationId: TypedMap<string>) {
    switch (filter.type) {
        case FilterType.CLASSIFICATION_EXISTENCE:
            let hasClassification = block.classificationIds.includes(filter.classificationId);
            return filter.includeExclude === Inclusion.INCLUDE ? hasClassification : !hasClassification;

        case FilterType.FIELD_VALUE:
            // Should never happen, but to be safe...
            if (!filter.comparator || !filter.value)
                return false;

            // Make sure the block has the field's classification currently active.
            // Only want to do this for "inclusive" comparators, not "exclusive" ones.
            if (!EXCLUSIVE_COMPARATORS.includes(filter.comparator)) {
                let classificationId = fieldIdToClassificationId[filter.fieldId];
                if (classificationId && !block.classificationIds.includes(classificationId))
                    return false;
            }

            // Finally, look up the value to filter on, and filter away!
            let filterValue: any;
            if (Array.isArray(filter.value)) {
                filterValue = filter.value.map(val => pvLookups[val].name)
            } else if (StringUtils.isString(filter.value)) {
                filterValue = pvLookups[filter.value as string]?.name || filter.value;
            } else {
                filterValue = filter.value;
            }
            return passesComparator(block.fieldValues[filter.fieldId] || '', filterValue, filter.comparator);

        case FilterType.SUMMARY_TEXT:
            return passesComparator(block.content.data.text, filter.value, filter.comparator);
    }
}

export function filterBlocks(blocks: Entity[], filterChain: FilterChain, pvLookups: TypedMap<PossibleValueDefinition>, fieldIdToClassificationId: TypedMap<string>) {
    return blocks
        .filter((block) => {
            if (filterChain.conjunction === Conjunction.AND) {
                return filterChain.filters.every(filter => passesFilter(block, filter, pvLookups, fieldIdToClassificationId));
            } else if (filterChain.conjunction === Conjunction.OR) {
                return filterChain.filters.some(filter => passesFilter(block, filter, pvLookups, fieldIdToClassificationId));
            } else {
                // Shouldn't be possible, but if we get here, omit the block.
                return false;
            }
        });
}