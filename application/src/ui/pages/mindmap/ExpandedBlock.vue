<template>
    <div class="mw-app-relationship-expandedblock">
        <!-- Add Classifications / Extra Fields -->
        <div class="mw-block-content-section add-classifications-fields">
            <div class="title-col clickable" title="Edit the classifications defined for this board."
                v-on:click="editClassifications()">
                <eic-svg-pencil width="18" height="18"></eic-svg-pencil>
                <span>Classifications:</span>
            </div>

            <div class="content-col">
                <eic-checkbox v-for="cid in classificationIds" v-bind:key="cid"
                    v-bind:eic-label="classificationDefs[cid].name"
                    v-model="classificationSelections[cid]"
                    v-on:click="setClassification(cid, !classificationSelections[cid])"
                    ></eic-checkbox>
            </div>

            <!-- TODO-ben: More formally remove "Fields" -->
            <!-- <div class="title-col clickable" title="Edit the extra fields defined on this block."
                v-on:click="editFields()">
                <eic-svg-pencil width="18" height="18"></eic-svg-pencil>
                <span>Extra Fields:</span>
            </div>

            <div class="content-col">
                <span v-if="fieldNames !== ''" class="field-display">{{ fieldNames }}</span>
                <span v-else class="no-field-display">(none)</span>
            </div> -->
        </div>

        <!-- Classifications -->
        <div class="mw-block-content-section mw-classification-flex"
            v-for="cid of displayedClassificationIds" v-bind:key="'block-expanded-' + cid">
            <div>{{ classificationDefs[cid].name }}</div>
            <div>
                <div class="field-row" v-for="fid of getDisplayedFieldIds(cid)" v-bind:key="'block-expanded-' + fid">
                    <!-- Non-textareas split the width between the field name and value -->
                    <div v-if="fieldDefs[fid].type !== 'Text Editor'">
                        <div class="field-name-col">{{ fieldDefs[fid].name }}</div>
                        <eic-dynamic-field class="field-component-col"
                                v-bind:eicFieldDef="fieldDefs[fid]"
                                v-bind:possibleValueCounts="activeFieldValueCounts[fid]"
                                v-bind:keyPrefix="'expandedblock-'"
                                v-on:eic-val-set="setFieldValue(fid, $event)"></eic-dynamic-field>
                    </div>
                    <!-- Textareas take up the full width for maximum awesomeness displaying. -->
                    <div v-else>
                        <eic-markdowneditor
                            v-model="blockCopy.fieldValues[fid]"
                            v-bind:mw-editor-title="fieldDefs[fid].name"
                            v-bind:eic-visible-textarea-rows="20"
                            v-on:eic-val-set="setFieldValue(fid, $event)"
                            v-on:mw-exit-edit-mode="$emit('mw-update-size')"
                            v-on:mw-enter-edit-mode="$emit('mw-update-size')"
                            ></eic-markdowneditor>
                    </div>
                </div>
            </div>
        </div>

        <!-- Fields -->
        <div class="mw-block-content-section" v-if="displayedFieldIds.length > 0">
            <div class="field-row" v-for="fid of displayedFieldIds" v-bind:key="'block-expanded-' + fid">
                <!-- Non-textareas split the width between the field name and value -->
                <div v-if="fieldDefs[fid].type !== 'Text Editor'">
                    <div class="field-name-col">{{ fieldDefs[fid].name }}</div>
                    <eic-dynamic-field class="field-component-col"
                            v-bind:eicFieldDef="fieldDefs[fid]"
                            v-bind:possibleValueCounts="activeFieldValueCounts[fid]"
                            v-bind:keyPrefix="'expandedblock-'"
                            v-on:eic-val-set="setFieldValue(fid, $event)"></eic-dynamic-field>
                </div>
                <!-- Textareas take up the full width for maximum awesomeness displaying. -->
                <div v-else>
                    <eic-markdowneditor
                        v-model="blockCopy.fieldValues[fid]"
                        v-bind:mw-editor-title="fieldDefs[fid].name"
                        v-bind:eic-visible-textarea-rows="20"
                        v-on:eic-val-set="setFieldValue(fid, $event)"
                        v-on:mw-exit-edit-mode="$emit('mw-update-size')"
                        v-on:mw-enter-edit-mode="$emit('mw-update-size')"
                        ></eic-markdowneditor>
                </div>
            </div>
        </div>

        <div v-if="displayedFieldIds.length === 0 && displayedClassificationIds.length === 0"
            class="mw-block-content-section mw-no-facs-to-display">
            This block has nothing extra to display. Consider adding some classifications with fields to view them here.
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

import { useStore } from "../../store/store";
import { useEditableFields } from '../../composables/EditableFields';
import { useEditableClassifications } from '../../composables/EditableClassifications';

import { Block } from 'constellation-common/datatypes';


export default defineComponent({
    props: {
        eicBlock: Object,
        isPreview: Boolean,
    },
    setup(props, context) {
        const store = useStore();

        let editableFields = useEditableFields();
        let editableClassifications = useEditableClassifications();

        let classificationIds = computed(() => store.getters.classificationIds);
        let classificationDefs = computed(() => store.getters.classifications);
        let fieldDefs = computed(() => store.getters.fields);
        let pvDefs = computed(() => store.getters.possibleValues);

        let activeFieldValueCounts = computed(() => store.getters.activeFieldValueCounts([props.eicBlock!.id]));

        let displayedClassificationIds = computed(() => {
            return classificationIds.value
                // Keep only the classifications our block has activated
                .filter(cid => (props.eicBlock as Block).classificationIds.includes(cid));
        });
        let displayedFieldIds = computed(() => {
            return (props.eicBlock! as Block).fieldIds;
        });


        // ================================
        // Classification and Field Editing
        // --------------------------------

        let editFields = () => {
            editableFields.openEditFieldsDialog(
                [(props.eicBlock as Block).id],
                (props.eicBlock as Block).fieldIds,
                fieldDefs.value,
                pvDefs.value);
        };
        let editClassifications = () => {
            editableClassifications.openEditClassificationsDialog(
                classificationIds.value,
                classificationDefs.value,
                fieldDefs.value,
                pvDefs.value);
        }
        let setClassification = (classificationId: string, isActive: boolean): void => {
            editableClassifications.setClassificationOnBlocks([(props.eicBlock as Block).id], classificationId, isActive);
        };
        let setFieldValue = (fieldId: string, event: any): void => {
            editableFields.setFieldValueOnBlocks([props.eicBlock! as Block], fieldId, event);
        }

        let classificationSelections = computed(() => {
            return classificationIds.value.reduce((prev: any, curr) => {
                prev[curr] = (props.eicBlock as Block).classificationIds.includes(curr);
                return prev;
            }, {});
        });

        return {
            // Lookup Maps
            classificationDefs, fieldDefs, pvDefs,
            activeFieldValueCounts,

            // Displayed Data
            classificationIds, displayedClassificationIds,
            displayedFieldIds,
            blockCopy: computed(() => JSON.parse(JSON.stringify(props.eicBlock!))),

            // Classification / Field Editing
            classificationSelections,
            editFields, editClassifications,
            setFieldValue, setClassification,

            // Utility Functions
            getDisplayedFieldIds: (cid: string) => {
                return classificationDefs.value[cid].fieldIds;
            },
            fieldNames: computed(() => {
                return (props.eicBlock as Block).fieldIds.map(fid => fieldDefs.value[fid].name).join(', ');
            })
        }
    },
})
</script>

<style lang="css">

.mw-app-relationship-expandedblock {
    width: 600px;

    /* Need to re-enable text selection. The canvas disables it for all children by default. */
    user-select: text;
    -moz-user-select: text;
    -webkit-user-select: text;

    .add-classifications-fields {
        font-size: 16px;
        color: var(--gray4);

        /* Gridbox Setup */
        display: grid;
        grid-template-columns: auto 1fr;
        row-gap: 0.5em;
        column-gap: 15px;
        &>.title-col   { grid-column-start: 1; grid-column-end: 2; }
        &>.content-col { grid-column-start: 2; grid-column-end: 3; }

        .mw-checkbox {
            display: inline-block;
            margin-right: 15px;
        }

        .mw-svg-pencil     { margin-right: 5px; }
        &>.title-col>* { vertical-align: middle; }

        &>.title-col.clickable {
            cursor: pointer;
            &:hover {
                color: var(--gray-very-light);
                .mw-svg-pencil { stroke: var(--gray-very-light); }
            }
        }

        .field-display    { color: var(--gray-very-light); margin-right: 15px; }
        .no-field-display { color: var(--gray4); }
    }

    .mw-classification-flex {
        display: flex;

        &>div:first-child {
            color: var(--gray4);

            flex-grow: 0;
            flex-shrink: 0;

            margin-right: 10px;
            margin-left: -20px;
            font-size: 1.0rem;

            /* Rotates and centers the classification name */
            writing-mode: vertical-rl;
            text-align: center;
        }
        &>div:last-child {
            flex-grow: 1;
            flex-shrink: 1;
            min-width: 0;

            border-left: 1px dashed var(--gray4);
            border-radius: var(--radius-large);
            padding-left: 20px;
        }
    }

    .field-row:first-child { margin-top: 10px; }
    .field-row:last-child { margin-bottom: 10px; }
    .field-row {
        margin: 20px 0;
        .field-name-col      { width: 35%; display: inline-block; }
        .field-component-col { width: 65%; display: inline-block; }

        .field-name-col {
            vertical-align: top;
            color: var(--gray4);
            font-size: 18px;
        }
        .mw-markdowneditor {
            .title {
                color: var(--gray4);
                font-size: 18px;
            }
        }
    }

    .mw-no-facs-to-display { color: var(--gray4); }

}
</style>
