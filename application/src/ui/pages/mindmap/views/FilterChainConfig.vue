<template>
    <div class="mw-app-filterconfig">
        <div v-for="filter, i in mwFilterChain.filters" v-bind:key="'filter-' + i"
            class="mwe-filter mwm-existing"
            v-bind:class="{ 'mwm-being-deleted': filterBeingDeleted === i }"
            v-on:mouseover="filterBeingHovered = i"
            v-on:mouseleave="filterBeingHovered = -1">

            <!-- Conjunction junction, what's your function? -->
            <div class="mwe-filter-conjunction">
                <eic-dropdown
                    v-if="i !== 0"
                    v-bind:mw-disabled="i !== 1"
                    v-bind:eic-options="conjunctionOpts"
                    v-model="mwFilterChain.conjunction"
                    ></eic-dropdown>
            </div>

            <!-- Classification Check -->
            <template v-if="filter.type === FilterType.CLASSIFICATION_EXISTENCE">
                <eic-dropdown
                    v-bind:eic-options="inclusionOpts"
                    v-model="filter.includeExclude"
                    ></eic-dropdown>
                <p>blocks classified as</p>
                <eic-dropdown class="mwe-flex-adjust-1" v-bind:eic-options="classificationOptions" v-model="filter.classificationId"></eic-dropdown>
            </template>

            <!-- Field Value Check -->
            <template v-else-if="filter.type === FilterType.FIELD_VALUE">
                <eic-dropdown v-bind:eic-options="classificationFieldPairOptions"
                    v-model="filter.fieldId"
                    v-on:eic-val-set="updateFieldSelection(filter, $event)"></eic-dropdown>
                <!-- String Fields -->
                <template v-if="getFieldDataTypeGivenFieldId(filter.fieldId) === DataType.TEXT">
                    <eic-dropdown v-model="filter.comparator" v-bind:eic-options="stringComparatorOpts"></eic-dropdown>
                    <eic-textbox v-model="filter.value" class="mwe-flex-adjust-1"></eic-textbox>
                </template>
                <!-- Single-Select Fields -->
                <template v-else-if="getFieldDataTypeGivenFieldId(filter.fieldId) === DataType.SINGLE_SELECT">
                    <eic-dropdown v-model="filter.comparator" v-bind:eic-options="singleSelectComparatorOpts"></eic-dropdown>
                    <eic-dropdown v-model="filter.value" v-bind:eic-options="getPossibleValueOptsForField(filter.fieldId)" class="mwe-flex-adjust-1"></eic-dropdown>
                </template>
                <!-- Multi-Select Fields -->
                <template v-else-if="getFieldDataTypeGivenFieldId(filter.fieldId) === DataType.MULTI_SELECT">
                    <eic-dropdown v-model="filter.comparator" v-bind:eic-options="multiSelectComparatorOpts"></eic-dropdown>
                    <eic-dropdown v-model="filter.value" v-bind:mw-multiple="true" v-bind:eic-options="getPossibleValueOptsForField(filter.fieldId)" class="mwe-flex-adjust-1"></eic-dropdown>
                </template>
                <!-- Temporal Fields -->
                <template v-else-if="getFieldDataTypeGivenFieldId(filter.fieldId) === DataType.TEMPORAL">
                    <eic-dropdown v-model="filter.comparator" v-bind:eic-options="temporalComparatorOpts" class="mwe-flex-adjust-1"></eic-dropdown>
                    <template v-if="filter.comparator === TemporalComparator.WITHIN_NEXT_X">
                        <eic-textbox v-model="filter.value.quantity" mw-type="number" v-bind:mw-input-extras="{ min: 0 }"></eic-textbox>
                        <eic-dropdown v-model="filter.value.unit" v-bind:eic-options="temporalUnitOpts"></eic-dropdown>
                    </template>
                    <template v-else>
                        <eic-datetime v-bind:mwFieldType="getFieldTypeGivenFieldId(filter.fieldId)" class="mwe-flex-adjust-1" v-model="filter.value.datetime"/>
                    </template>
                </template>
            </template>

            <!-- Summary Text Check -->
            <template v-else-if="filter.type === FilterType.SUMMARY_TEXT">
                <p>Block's summary text</p>
                <eic-dropdown v-bind:eic-options="stringComparatorOpts" v-model="filter.comparator"></eic-dropdown>
                <eic-textbox v-model="filter.value" class="mwe-flex-adjust-1"></eic-textbox>
            </template>

            <eic-svg-deletion-x
                v-on:mouseover="filterBeingDeleted = i"
                v-on:mouseleave="filterBeingDeleted = -1"
                v-bind:style="{ opacity: filterBeingHovered === i ? 1 : 0 }"
                width="25" height="25"
                v-on:click="deleteFilter(i)"></eic-svg-deletion-x>
        </div>
        <div class="mwe-filter mwm-new" v-bind:class="{ 'mwe-show-dashed-line': mwFilterChain.filters.length > 0 }">
            <div class="mwe-filter-conjunction">
                <eic-dropdown
                    v-if="mwFilterChain.filters.length > 0"
                    v-bind:mw-disabled="mwFilterChain.filters.length !== 1"
                    v-bind:eic-options="conjunctionOpts"
                    v-model="mwFilterChain.conjunction"
                    ></eic-dropdown>
            </div>
            <eic-dropdown
                class="mwe-filter-type-dropdown"
                v-bind:eic-options="filterTypeOpts"
                v-model="newFilterType"
                v-bind:mw-placeholder="FILTER_PLACEHOLDER"
                v-on:eic-val-set="pushNewFilter"
                ></eic-dropdown>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";

import { useStore } from "../../../store/store";

import {
    // Dropdown Options
    FILTER_TYPE_OPTS,
    CONJUNCTION_OPTS,
    INCLUSION_OPTS,
    STRING_COMPARATOR_OPTS,
    SINGLE_SELECT_COMPARATOR_OPTS,
    MULTI_SELECT_COMPARATOR_OPTS,
    TEMPORAL_COMPARATOR_OPTS,
    TEMPORAL_UNIT_OPTS,
} from "../../../store/Types/ViewStoreTypes";

import {
    // Enums
    FilterType,
    Inclusion,
    StringComparator,
    SingleSelectComparator,
    MultiSelectComparator,
    TemporalComparator,
    TemporalUnit,
    // Types
    FilterChain,
    Filter,
    FieldValueFilter,
    // Other
    DataType, FieldType
} from 'constellation-common/datatypes';

export default defineComponent({
    props: {
        mwFilterChain: Object, // of type "ViewDataTypes.FilterChain"
    },
    setup(props) {
        const store = useStore();

        const FILTER_PLACEHOLDER = "Add a condition..."
        let newFilterType = ref(FILTER_PLACEHOLDER);

        const classificationOptions = computed(() => store.getters.classificationOptions);
        const classificationFieldPairOptions = computed(() => store.getters.classificationFieldPairOptions());

        function updateFieldSelection(filter: FieldValueFilter, newFieldId: string) {
            let dataType = store.getters.getFieldDataTypeGivenFieldId(newFieldId);
            switch (dataType) {
                case DataType.TEXT:
                    filter.comparator = StringComparator.CONTAINS;
                    filter.value = '';
                    break;
                case DataType.SINGLE_SELECT:
                    let ssPVs = store.getters.getPossibleValueOptsForField(newFieldId);
                    filter.comparator = SingleSelectComparator.EQUALS;
                    filter.value = ssPVs.length > 0 ? ssPVs[0].value : '';
                    break;
                case DataType.MULTI_SELECT:
                    let msPVs = store.getters.getPossibleValueOptsForField(newFieldId);
                    filter.comparator = MultiSelectComparator.ANY_ONE_OF;
                    filter.value = msPVs.length > 0 ? [msPVs[0].value] : [];
                    break;
                case DataType.TEMPORAL:
                    filter.comparator = TemporalComparator.BEFORE;
                    filter.value = {
                        quantity: 0,
                        unit: TemporalUnit.DAY,
                        datetime: { date: '', time: '' },
                    };
                    break;
            }
        }
        function getBlankFilterConfig(filterType: FilterType): Filter {
            switch (filterType) {
                case FilterType.CLASSIFICATION_EXISTENCE:
                    return {
                        type: FilterType.CLASSIFICATION_EXISTENCE,
                        includeExclude: Inclusion.INCLUDE,
                        classificationId: classificationOptions.value.length > 0 ? classificationOptions.value[0].value : '',
                    };
                case FilterType.FIELD_VALUE:
                    let filter: Filter = {
                        type: FilterType.FIELD_VALUE,
                        fieldId: classificationFieldPairOptions.value.length > 0 ? classificationFieldPairOptions.value[0].value : '',
                        comparator: null,
                        value: '',
                    };
                    if (filter.fieldId !== '') {
                        updateFieldSelection(filter, filter.fieldId!)
                    }
                    return filter;
                case FilterType.SUMMARY_TEXT:
                    return {
                        type: FilterType.SUMMARY_TEXT,
                        comparator: StringComparator.CONTAINS,
                        value: '',
                    };
            }
        }


        let filterBeingHovered = ref(-1);
        let filterBeingDeleted = ref(-1);

        return {
            // Enums
            DataType,
            FieldType,
            FilterType,
            // Dropdown Options
            filterTypeOpts: FILTER_TYPE_OPTS.map(opt => {
                if (opt.value === FilterType.CLASSIFICATION_EXISTENCE && classificationOptions.value.length === 0) {
                    return { ...opt, disabled: true };
                } else if (opt.value === FilterType.FIELD_VALUE && classificationFieldPairOptions.value.length === 0) {
                    return { ...opt, disabled: true };
                }
                return opt;
            }),
            conjunctionOpts: CONJUNCTION_OPTS,
            inclusionOpts: INCLUSION_OPTS,
            stringComparatorOpts: STRING_COMPARATOR_OPTS,
            singleSelectComparatorOpts: SINGLE_SELECT_COMPARATOR_OPTS,
            multiSelectComparatorOpts: MULTI_SELECT_COMPARATOR_OPTS,
            temporalComparatorOpts: TEMPORAL_COMPARATOR_OPTS,
            temporalUnitOpts: TEMPORAL_UNIT_OPTS,
            TemporalComparator,
            classificationOptions,
            classificationFieldPairOptions,
            getFieldTypeGivenFieldId:     store.getters.getFieldTypeGivenFieldId,
            getFieldDataTypeGivenFieldId: store.getters.getFieldDataTypeGivenFieldId,
            getPossibleValueOptsForField: store.getters.getPossibleValueOptsForField,

            FILTER_PLACEHOLDER,
            newFilterType,

            filterBeingHovered,
            filterBeingDeleted,

            pushNewFilter: () => {
                (props.mwFilterChain as FilterChain).filters.push(getBlankFilterConfig(newFilterType.value as FilterType));
                setTimeout(() => newFilterType.value = FILTER_PLACEHOLDER, 0);
            },
            changeFilterType: (filterIndex: number, newType: FilterType) => {
                (props.mwFilterChain as FilterChain).filters[filterIndex] = getBlankFilterConfig(newType);
            },
            deleteFilter: (filterIndex: number) => {
                (props.mwFilterChain as FilterChain).filters.splice(filterIndex, 1);
                filterBeingHovered.value = -1;
                filterBeingDeleted.value = -1;
            },
            updateFieldSelection,
        };
    }
})
</script>

<style>

@import url("../viewstyles.css");

.mw-app-filterconfig {
    max-height: 400px;
    overflow: auto;

    border: 1px solid var(--gray3);
    border-radius: 6px;
    background: var(--gray-dark);

    .mwe-filter {
        padding: 10px 10px;
        position: relative;

        &.mwe-show-dashed-line {
            border-top: 1px dashed var(--gray3);
        }

        color: var(--gray-very-light);

        p { margin: 0; }

        /* -- Flex Config -- */
        display: flex;
        gap: 10px;
        align-items: center;
        .mwe-filter-conjunction { flex-basis: 75px; flex-shrink: 0; }
        .mwe-flex-adjust-1 { flex-grow: 1; flex-shrink: 1; }

        .mwe-filter-type-dropdown { max-width: 250px; }

        .mw-svg-deletionx {
            opacity: 0; /* Gets changed when filter is hovered */
            transition: opacity 0.2s;
        }

        transition: border-color 0.2s, background-color 0.2s;

        &.mwm-being-deleted.mwm-existing {
            background: color-mix(in hsl, var(--red-error) 20%, transparent);
        }
    }
}

</style>
