<template>
    <div class="mw-app-actionpane"
        v-bind:style="{width: `${paneWidth}px`, right: mwSelectedBlocks.length >= mwShowAfterNumberSelected ? '0' : `${-paneWidth-10}px`}"
        v-bind:class="{ 'disable-pointer-events': pointerEventsDisabled }">

        <h1>Bulk Actions</h1>

        <template v-if="mwSelectedBlockIds.length == 0">
            Select some blocks to perform bulk actions.
        </template>

        <template v-else>
            <p class="mw-block-count">({{ mwSelectedBlockIds.length }} block<span v-if="mwSelectedBlockIds.length > 1">s</span> selected)</p>

            <!--====================-->
            <!-- Alignment Controls -->
            <!--====================-->
            <template v-if="mwShowAlignmentControls">
                <div class="actionpane-heading">
                    <h2>Size / Position</h2>
                </div>
                <eic-alignment-controls></eic-alignment-controls>
            </template>

            <!--=================-->
            <!-- Classifications -->
            <!--=================-->
            <div class="actionpane-heading">
                <h2>Classifications</h2>
            </div>
            <div class="edit-button" v-on:click="editClassifications">edit</div>

            <div class="classification-list">
                <eic-checkbox v-for="cid in classificationIds" v-bind:key="cid"
                    v-bind:eic-label="getClassificationLabel(classificationDefs[cid])"
                    v-model="classificationCounts[cid].isSelected"
                    v-on:click="setClassificationOnBlocks(mwSelectedBlocks, cid, !classificationCounts[cid].isSelected)"
                    ></eic-checkbox>

                <div v-if="Object.keys(classificationDefs).length === 0">
                    Classifications are a reusable way to add groups of fields to your blocks.
                </div>
            </div>

            <!--========-->
            <!-- Fields -->
            <!--========-->
            <div class="actionpane-heading">
                <h2>Fields</h2>
            </div>
            <div class="edit-button" v-if="mwSelectedBlockIds.length === 1" v-on:click="editFields">edit</div>

            <!-- Classification Fields -->
            <div class="field-grouping eic-classification-flex" v-for="cid in activeClassificationIdsSorted" v-bind:key="cid">
                <div>{{ classificationDefs[cid].name }}</div>
                <div>
                    <div class="field"
                        v-for="fieldId in activeClassificationFieldIds[cid]" v-bind:key="fieldId">
                        <div class="field-name">{{ fieldDefs[fieldId].name }}</div>
                        <eic-dynamic-field
                            v-bind:eicFieldDef="fieldDefs[fieldId]"
                            v-bind:possibleValueCounts="activeFieldValueCounts[fieldId]"
                            v-bind:keyPrefix="'actionpane-'"
                            v-on:eic-val-set="setFieldValueOnBlocks(mwSelectedBlocks, fieldId, $event)"></eic-dynamic-field>
                    </div>
                </div>
            </div>

            <!-- Block Fields -->
            <div class="field-grouping">
                <div v-for="fieldId in activeBlockFieldIds" v-bind:key="fieldId" class="field">
                    <div class="field-name">{{ fieldDefs[fieldId].name }}</div>
                    <eic-dynamic-field
                        v-bind:eicFieldDef="fieldDefs[fieldId]"
                        v-bind:possibleValueCounts="activeFieldValueCounts[fieldId]"
                        v-bind:keyPrefix="'actionpane-'"
                        v-on:eic-val-set="setFieldValueOnBlocks(mwSelectedBlocks, fieldId, $event)"></eic-dynamic-field>
                </div>
            </div>
            <p class="eic-hidden-fields" v-bind:class="{ highlight: hiddenFieldCount !== 0 }" title="Only fields that exist on all selected blocks are displayed.">
                {{ hiddenFieldCount }} fields are hidden.
            </p>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";

import { useStore } from "../../../store/store";
import { useEditableFields } from "../../../composables/EditableFields";
import { useEditableClassifications } from "../../../composables/EditableClassifications";
import { ClassificationDefinition, Block } from 'constellation-common/datatypes';

export default defineComponent({
    props: {
        mwShowAfterNumberSelected: Number,
        mwShowAlignmentControls: Boolean,
        mwSelectedBlocks: {
            type: Array as PropType<Block[]>,
            default: () => [],
        },
        mwSelectedBlockIds: {
            type: Array as PropType<string[]>,
            default: () => [],
        },
    },
    setup(props) {
        const store = useStore();

        let editableFields = useEditableFields();
        let editableClassifications = useEditableClassifications();

        // Definition lookup maps
        let classificationIds  = computed(() => store.getters.classificationIds);
        let classificationDefs = computed(() => store.getters.classifications);
        let fieldDefs          = computed(() => store.getters.fields);
        let possibleValueDefs  = computed(() => store.getters.possibleValues);

        // Displayed items
        let activeClassificationFieldIds  = computed(() => store.getters.activeClassificationFieldIds(props.mwSelectedBlockIds));
        let activeClassificationIdsSorted = computed(() => store.getters.classificationIds.filter(cid => activeClassificationFieldIds.value[cid]));
        let activeBlockFieldIds           = computed(() => store.getters.activeBlockFieldIds(props.mwSelectedBlockIds));
        let activeFieldValueCounts        = computed(() => store.getters.activeFieldValueCounts(props.mwSelectedBlockIds));

        let hiddenFieldCount = computed(() => {
            // Get a complete set of the fields all our selected blocks have
            let fieldSet = new Set<string>();
            let classificationSet = new Set<string>();
            props.mwSelectedBlocks.forEach(e => {
                store.getters.activeBlockFieldIds([e.id]).forEach(fid => fieldSet.add(fid));
                e.classificationIds
                    .filter(cid => classificationIds.value.includes(cid))
                    .forEach(cid => classificationSet.add(cid));
            });
            classificationSet.forEach(cid => {
                classificationDefs.value[cid].fieldIds?.forEach(fid => fieldSet.add(fid));
            });

            // Count the number of fields we're displaying
            let displayedFieldCount = activeBlockFieldIds.value.length;
            Object.values<string[]>(activeClassificationFieldIds.value).forEach(fieldIdArray => displayedFieldCount += fieldIdArray.length);

            // Return the difference
            return fieldSet.size - displayedFieldCount;
        });
        let classificationCounts = computed(() => {
            // Initialize the "counts" object
            let returnVal = classificationIds.value.reduce((prev: any, curr) => {
                prev[curr] = { blocksWithThis: 0, outOf: props.mwSelectedBlockIds.length };
                return prev;
            }, {});

            // Iterate over our blocks, counting each selected classification
            props.mwSelectedBlocks.forEach(e => {
                e.classificationIds
                    .filter(cid => classificationIds.value.includes(cid))
                    .forEach(cid => returnVal[cid].blocksWithThis++);
            });

            // Appropriately set the "isSelected" flag for each classification
            Object.values(returnVal).forEach((val: any) => {
                val.isSelected = val.blocksWithThis > 0 && val.blocksWithThis === val.outOf;
            });

            return returnVal;
        });

        let getClassificationLabel = (classification: ClassificationDefinition) => {
            let label = classification.name;

            // Conditionally add on a "count" label
            let blocksWithThis = classificationCounts.value[classification.id].blocksWithThis;
            if (props.mwSelectedBlocks.length > 1 && blocksWithThis !== 0) {
                label += ` [${blocksWithThis}/${props.mwSelectedBlocks.length}]`
            }

            return label;
        };


        // ================================
        // Classification and Field Editing
        // --------------------------------

        let editFields = () => {
            editableFields.openEditFieldsDialog(
                props.mwSelectedBlockIds,
                activeBlockFieldIds.value,
                fieldDefs.value,
                possibleValueDefs.value);
        };
        let editClassifications = () => {
            editableClassifications.openEditClassificationsDialog(
                classificationIds.value,
                classificationDefs.value,
                fieldDefs.value,
                possibleValueDefs.value);
        }
        let setClassificationOnBlocks = (blocks: Block[], classificationId: string, isActive: boolean): void => {
            editableClassifications.setClassificationOnBlocks(blocks.map(e => e.id), classificationId, isActive);
        };
        let setFieldValueOnBlocks = (blocks: Block[], fieldId: string, event: any): void => {
            editableFields.setFieldValueOnBlocks(blocks, fieldId, event);
        }

        return {
            // Constants
            paneWidth: 300, // (If you ever want to change this, grep for '300px'. This value is in a couple places because bad reasons.)

            // Computed
            classificationIds, classificationDefs, fieldDefs,
            activeClassificationFieldIds, activeClassificationIdsSorted, activeBlockFieldIds,
            classificationCounts, activeFieldValueCounts, hiddenFieldCount,
            pointerEventsDisabled: computed(() => store.getters.pointerEventsDisabled),

            // Methods
            getClassificationLabel,
            editFields, editClassifications, setClassificationOnBlocks, setFieldValueOnBlocks,
        }
    }
})
</script>

<style lang="scss">
@use "../../../styles/variables" as vars;
@use "../../../styles/mixins";

.mw-app-actionpane {

    &.disable-pointer-events {
        pointer-events: none;
    }

    position: absolute;
    transition: right 0.1s;
    top: 0;
    z-index: 0;

    color: vars.$gray4;
    background: vars.$gray-very-dark;
    box-shadow: -4px 0px 4px rgba(0, 0, 0, 0.25);
    height: 100%;

    padding: 25px;
    overflow-y: auto;
    @include mixins.scrollbars;

    .mw-block-count {
        text-align: center;
        margin-top: -30px;
        margin-bottom: 30px;
    }

    h1 { text-align: center; margin-bottom: 35px; font-weight: bold; color: vars.$gray3; }
    .actionpane-heading {
        width: 100%;
        border-bottom: 1px solid vars.$gray3;
        h2 { margin: 0; padding: 0; font-weight: normal; color: vars.$gray4; }
    }
    .edit-button { float: right; cursor: pointer; }
    .edit-button:hover { color: vars.$gray-very-light; }

    .classification-list {
        margin: 40px 0;
        & > * {
            margin: 5px 0;
        }
    }
    .field-grouping {
        margin: 40px 0;

        .field {
            margin-top: 20px;
            .field-name { font-size: 18px; margin-bottom: 5px; }
            .mw-app-dynamicfield {
                border-left: 2px solid vars.$pink-medium;
                margin-left: 2px;
                padding-left: 10px;
            }
        }
    }

    .eic-classification-flex {
        display: flex;
        margin-left: -20px;
        .field:first-child { margin-top: 0; }
        &>div:first-child {
            flex-grow: 0;
            flex-shrink: 0;

            padding-right: 3px;
            font-size: 1.0rem;

            // Rotates and centers the classification name
            writing-mode: vertical-rl;
            text-align: center;
        }
        &>div:last-child {
            flex-grow: 1;
            flex-shrink: 1;
            min-width: 0;

            border-left: 1px dashed vars.$gray3;
            border-radius: vars.$radius-large;
            padding: 10px; padding-right: 0;
        }
    }

    .eic-hidden-fields {
        cursor: help;
        text-align: center;
        font-size: 1.0rem;

        &.highlight { color: vars.$gray-very-light; }
    }
}

</style>
