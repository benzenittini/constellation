<template>
    <!-- TODO-ben: DELETE THIS ENTIRE DIALOG. -->
    <div class="mw-app-actionpane-editfieldsdialog" ref="editFieldsDialog" v-on:mousemove="checkForVerticalScroll">
        <div class="eic-dialog-section eic-info-section">
            <p class="eic-padded-row">This dialog shows fields that have been directly added to the selected blocks. This
                does not show fields inherited through classifications. Adding fields directly to
                blocks is generally not a great practice to follow, but we provide it here for the one-off
                situations where it could make sense. In general, use classifications whenever
                possible.</p>
        </div>

        <div class="eic-dialog-section">
            <!-- Header Row -->
            <div class="eic-drag-col"></div> <!-- Just a spacer. -->
            <div class="eic-header-row eic-padded-row eic-table-cols">
                <div class="eic-cell eic-name-col"><h3>Name</h3></div>
                <div class="eic-cell eic-type-col"><h3>Type</h3></div>
                <div class="eic-cell eic-pv-col"><h3>Possible Values</h3></div>
            </div>

            <!-- Field Rows -->
            <div ref="tableRef">
                <div class="eic-field-row"
                    v-for="(fieldDef, i) of fieldDefs"
                    v-bind:key="fieldDef.id"
                    v-bind:mw-field-id="fieldDef.id"
                    v-bind:class="{ 'deletion-highlight': rowToDelete === fieldDef.id }">
                    <div class="eic-padded-row"
                        v-on:mouseenter="hoveredRow = fieldDef.id"
                        v-on:mouseleave="hoveredRow = undefined">
                        <eic-svg-draghandle class="eic-drag-col field-drag-handle" v-bind:style="{ opacity: hoveredRow === fieldDef.id ? 1 : 0 }"></eic-svg-draghandle>
                        <eic-field-row class="eic-table-cols"
                            :ref="el => { if (el) fieldRowElements[i] = el }"
                            v-bind:field-def="fieldDef"
                            v-bind:possible-value-defs="possibleValueDefs"
                            v-bind:is-focused="focusedFieldId === fieldDef.id"
                            v-bind:is-hovered="hoveredRow === fieldDef.id"
                            v-bind:is-existing-field="originalFieldIds.includes(fieldDef.id)"
                            v-bind:show-tree="false"
                            v-on:mw-toggle-possible-value-pane="togglePVPaneExpansion($event)"
                            v-on:mw-hovered-for-deletion="rowToDelete = $event.isHovered ? hoveredRow : undefined"
                            v-on:mw-delete-field="deleteField($event)"></eic-field-row>
                    </div>
                    <transition name="pv-slide-open">
                        <eic-possible-value-pane
                            v-if="shouldShowPVPane(fieldDef)"
                            v-on:focusin="focusedFieldId = fieldDef.id"
                            v-on:focusout="focusedFieldId = undefined"
                            v-bind:field-def="fieldDef"
                            v-bind:possible-value-defs="possibleValueDefs"
                            v-bind:style-for-field-deletion="rowToDelete === fieldDef.id"
                        ></eic-possible-value-pane>
                    </transition>
                </div>
            </div>

            <!-- Create New Field -->
            <div class="eic-add-field-row">
                <div class="eic-padded-row">
                    <div class="eic-drag-col"></div> <!-- Just a spacer. -->
                    <div class="eic-table-cols">
                        <div class="eic-cell eic-name-col">
                            <eic-textbox eic-placeholder="+ Add Field" v-on:eic-focus="addNewField()"></eic-textbox>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUpdate, onMounted, onUnmounted, reactive, Ref, ref } from "vue";
import { v4 as uuidv4 } from 'uuid';
import dragula from 'dragula';

import { FieldDefinition, FieldType, fieldTypeHasPVs } from 'constellation-common/datatypes';

import { useDragula } from './DragulaComposition';

export default defineComponent({
    props: {
        fieldDefs: Array,
        possibleValueDefs: Object,
    },
    setup(props) {

        // -- Element Refs --

        // (see: https://v3.vuejs.org/guide/composition-api-template-refs.html#usage-inside-v-for)
        let fieldRowElements = ref([]);
        onBeforeUpdate(() => {
            fieldRowElements.value = [];
        });

        // -- User-Input Refs

        let hoveredRow = ref(undefined); // When a field row is hovered, this gets set to that field id
        let rowToDelete = ref(undefined); // When a "deletion x" is hovered, this gets set to that field id
        let expandedPVFieldId: Ref<string | undefined> = ref(undefined); // When a user expands a field's possible values, this gets set to that field id
        let focusedFieldId = ref(undefined); // When a user has something in the possible value pane focused, this gets set to that field id

        // -- Field CRUD --

        let addNewField = () => {
            props.fieldDefs!.push(reactive({
                id: uuidv4(),
                sourceType: 'block',
                name: '',
                type: FieldType.TEXTBOX,
                possibleValueIds: [],
            }));
            // Focus the "name" input in the last field row
            // The setTimeout is because we need to wait for vue to re-render.
            setTimeout(() => {
                (fieldRowElements.value[fieldRowElements.value.length-1] as any)
                    .$el.getElementsByTagName('input')[0].focus();
            }, 0);
        };
        let deleteField = (fieldId: string) => {
            if (fieldId) {
                let index = (props.fieldDefs! as FieldDefinition[]).findIndex(f => f.id === fieldId);
                if (index !== -1) {
                    props.fieldDefs!.splice(index, 1);
                }
            }
        };

        // -- Drag and Drop --

        let dragulaComposition = useDragula();

        const tableRef = ref(null);
        let fieldRowDrake: dragula.Drake | undefined = undefined;
        // Wrapped inside "onMounted" because we need to provide dragula with DOM refs
        onMounted(() => {
            // Field Row Manipulation
            fieldRowDrake = dragula([tableRef.value as any], {
                moves: function (el, container, handle) {
                    let shouldMove = dragulaComposition.wasHandleGrabbed(handle, 'field-drag-handle');

                    // Collapse the "possible value" pane when a drag event starts
                    if (shouldMove) {
                        expandedPVFieldId.value = undefined;
                        focusedFieldId.value = undefined;
                    }

                    return shouldMove;
                }
            });
            fieldRowDrake.on('drop', (el, target, source, sibling) => {
                dragulaComposition.dropField(el, sibling, (props.fieldDefs as FieldDefinition[]));
            });
            fieldRowDrake.on('cancel', (el, target, source) => {
                dragulaComposition.cancelField(el, (props.fieldDefs as FieldDefinition[]));
            });
        });

        // Auto-scroll setup
        let scrollAmount = ref(0);
        let editFieldsDialog = ref(null);
        let checkForVerticalScroll = (mouseEvent: MouseEvent) => {
            if (fieldRowDrake?.dragging) {
                scrollAmount.value = dragulaComposition.calculateScrollAmount(mouseEvent);
            }
        };
        let scrollTimer = setInterval(() => {
            if (fieldRowDrake?.dragging && scrollAmount.value !== 0) {
                (editFieldsDialog.value as unknown as HTMLElement).parentElement!.scrollBy({
                    top: scrollAmount.value/5, // "5" is just a magic number that seemed to scale the scroll speed ok.
                });
            }
        }, 20);
        onUnmounted(() => clearInterval(scrollTimer));

        return {
            // Element Refs
            fieldRowElements, tableRef, editFieldsDialog,

            // User-Input Refs
            hoveredRow, rowToDelete, expandedPVFieldId, focusedFieldId,

            // Data
            originalFieldIds: (props.fieldDefs! as FieldDefinition[]).map(f => f.id), // Intentionally not reactive - we want to know what the original fields were.

            // Methods
            fieldTypeHasPVs, addNewField, deleteField,
            shouldShowPVPane: (fieldDef: FieldDefinition) => expandedPVFieldId.value === fieldDef.id && fieldTypeHasPVs(fieldDef.type),
            togglePVPaneExpansion: (fieldId: string) => {
                expandedPVFieldId.value = (expandedPVFieldId.value === fieldId) ? undefined : fieldId;
            },
            checkForVerticalScroll,
        }
    }
})
</script>

<style>

.mw-app-actionpane-editfieldsdialog {
    .eic-dialog-section {
        /* Skip the margin on the last one - gap is taken care of by the "SaveCancel" component */
        &:not(:last-child) { margin-bottom: var(--dialog-section-gap); }
    }
}

</style>