<template>
    <div class="mw-app-actionpane-editclassificationsdialog" ref="editClassificationsDialog" v-on:mousemove="checkForVerticalScroll">
        <div class="eic-dialog-section eic-info-section">
            <p class="eic-padded-row"><span class="highlight">Classifications</span> allow you to categorize your blocks by adding groups of related fields to them. A block can have multiple classifications active at once, each providing a different set of fields. A <span class="highlight">field</span> lets you add custom metadata to your blocks. Certain field types are configured with <span class="highlight">possible values</span>, which go a step further to apply styles to your blocks when they have certain values set.</p>
            <p class="eic-padded-row">For example, you might have a "Person" classification that adds fields for "Phone Number", "Email Address", and "Contact Type". When "Contact Type" is set to "customer", style it with a red border, but when it's "employee", make it blue.</p>
        </div>

        <div ref="classificationWrapper">
            <div class="eic-dialog-section eic-classification-section"
                v-for="(cid, cIndex) in classificationIds" v-bind:key="cid"
                v-bind:mw-classification-id="cid">
                <div class="eic-classification-section-content"
                    v-bind:class="{ 'deletion-highlight': classificationToDelete === cid }"
                    :ref="el => { if (el) classificationElements[cid] = el }"
                    v-on:mouseover="hoveredClassification = cid"
                    v-on:mouseleave="hoveredClassification = undefined">

                    <!-- Header Row -->
                    <div class="eic-padded-row">
                        <eic-svg-draghandle width="20px" class="eic-drag-col classification-drag-handle"
                            v-bind:style="{ opacity: hoveredClassification === cid ? 1 : 0 }"></eic-svg-draghandle>
                        <div class="eic-header-row eic-table-cols">
                            <eic-textbox class="eic-cell eic-name-col"
                                v-model="classificationDefs[cid].name"
                                eic-placeholder="Classification Name"></eic-textbox>

                            <div class="eic-cell eic-type-col"><h3>Field Type</h3></div>
                            <div class="eic-cell eic-pv-col"><h3>Possible Values</h3></div>

                            <eic-svg-deletion-x width="30px" class="mw-delete-classification"
                                v-on:mouseover="classificationToDelete = hoveredClassification"
                                v-on:mouseleave="classificationToDelete = undefined"
                                v-bind:style="{ opacity: hoveredClassification === cid ? 1 : 0 }"
                                v-on:click="deleteClassification(cid)"></eic-svg-deletion-x>
                        </div>
                    </div>

                    <!-- Field Rows -->
                    <div :ref="el => { if (el) fieldLists[cIndex] = el }"
                        v-bind:style="{ 'min-height': isDraggingField ? '35px' : 'auto' }"
                        v-bind:mw-classification-id="cid">
                        <div class="eic-field-row"
                            v-for="(fid, i) of classificationDefs[cid].fieldIds"
                            v-bind:key="fid"
                            v-bind:mw-field-id="fid"
                            v-bind:class="{ 'deletion-highlight': fieldRowToDelete === fid }">
                            <div class="eic-padded-row"
                                v-on:mouseover="hoveredFieldRow = fid"
                                v-on:mouseleave="hoveredFieldRow = undefined">
                                <eic-svg-draghandle class="eic-drag-col field-drag-handle"
                                    v-bind:style="{ opacity: hoveredFieldRow === fid ? 1 : 0 }"
                                    v-on:mouseup="isDraggingField = false"></eic-svg-draghandle>
                                <eic-field-row class="eic-table-cols"
                                    :ref="el => addFieldRowElement(el, cid, i)"
                                    v-bind:field-def="fieldDefs[fid]"
                                    v-bind:possible-value-defs="possibleValueDefs"
                                    v-bind:is-focused="focusedFieldId === fid"
                                    v-bind:is-hovered="hoveredFieldRow === fid"
                                    v-bind:is-existing-field="originalFieldIds.includes(fid)"
                                    v-bind:show-tree="true"
                                    v-on:mw-toggle-possible-value-pane="togglePVPaneExpansion($event)"
                                    v-on:mw-hovered-for-deletion="fieldRowToDelete = $event.isHovered ? hoveredFieldRow : undefined"
                                    v-on:mw-delete-field="deleteField(cid, $event)"></eic-field-row>
                            </div>
                            <transition name="pv-slide-open">
                                <eic-possible-value-pane
                                    v-if="expandedPVFieldId === fid && fieldTypeHasPVs(fieldDefs[fid].type)"
                                    v-on:focusin="focusedFieldId = fid"
                                    v-on:focusout="focusedFieldId = undefined"
                                    v-bind:field-def="fieldDefs[fid]"
                                    v-bind:possible-value-defs="possibleValueDefs"
                                    v-bind:style-for-field-deletion="fieldRowToDelete === fid"
                                ></eic-possible-value-pane>
                            </transition>
                        </div>
                    </div>

                    <!-- Create New Field -->
                    <div class="eic-add-field-row">
                        <div class="eic-padded-row">
                            <div class="eic-drag-col"></div> <!-- Just a spacer. -->
                            <div class="eic-table-cols">
                                <div class="eic-cell eic-name-col when-tree-is-displayed">
                                    <svg class="mw-tree" viewBox="0 0 100 130">
                                        <line x1="50%" y1="0%" x2="50%" y2="50%"></line>  <!-- Vertical -->
                                        <line x1="50%" y1="50%" x2="90%" y2="50%"></line> <!-- Horizontal -->
                                    </svg>
                                    <eic-textbox v-bind:mw-phantom="true" eic-placeholder="+ Add Field" v-on:eic-focus="addNewField(cid)"></eic-textbox>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create New Classification -->
        <div class="eic-dialog-section">
            <div class="eic-add-classification-row">
                <div class="eic-padded-row">
                    <div class="eic-drag-col"></div> <!-- Just a spacer. -->
                    <div class="eic-table-cols">
                        <div class="eic-name-col">
                            <eic-textbox v-bind:mw-phantom="true" eic-placeholder="+ Add Classification" v-on:eic-focus="addNewClassification()"></eic-textbox>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUpdate, onMounted, onUnmounted, onUpdated, Ref, ref } from "vue";
import { v4 as uuidv4 } from 'uuid';
import dragula from 'dragula';

import { TypedMap, ClassificationDefinition, FieldDefinition, FieldType, fieldTypeHasPVs  } from 'constellation-common/datatypes';

import { useDragula } from './DragulaComposition';

export default defineComponent({
    props: {
        classificationIds: Array, // Determines the ordering of the classifications
        classificationDefs: Object,
        fieldDefs: Object,
        possibleValueDefs: Object,
    },
    setup(props) {

        // -- Element Refs --

        // (see: https://v3.vuejs.org/guide/composition-api-template-refs.html#usage-inside-v-for)
        let classificationElements: Ref<any[]> = ref([]); // classificationElements[]
        let fieldLists: Ref<any[]> = ref([]); // listOfFields[] (1 field list per classification)
        let fieldRowElements: Ref<TypedMap<any[]>> = ref({}); // classificationId --> fieldElements[]
        onBeforeUpdate(() => {
            classificationElements.value = [];
            fieldLists.value = [];
            for (let key of Object.keys(fieldRowElements.value)) {
                fieldRowElements.value[key] = [];
            }
        });
        let addFieldRowElement = (el: any, classificationId: string, fieldIndex: number) => {
            if (!fieldRowElements.value[classificationId])
                fieldRowElements.value[classificationId] = [];
            if (el)
                fieldRowElements.value[classificationId][fieldIndex] = el 
        }

        // -- User-Input Refs

        let hoveredFieldRow = ref(undefined); // When a field row is hovered, this gets set to that field id
        let fieldRowToDelete = ref(undefined); // When a "deletion x" is hovered, this gets set to that field id

        let hoveredClassification = ref(undefined); // When a classification section is hovered, this gets set to that field id
        let classificationToDelete = ref(undefined); // When a "deletion x" is hovered, this gets set to that field id

        let expandedPVFieldId: Ref<string | undefined> = ref(undefined); // When a user expands a field's possible values, this gets set to that field id
        let focusedFieldId = ref(undefined); // When a user has something in the possible value pane focused, this gets set to that field id

        // -- Field CRUD --

        let addNewField = (classificationId: string) => {
            let fieldId = uuidv4();
            (props.fieldDefs![fieldId] as FieldDefinition) = {
                id: fieldId,
                sourceType: 'classification',
                name: '',
                type: FieldType.TEXTBOX,
                possibleValueIds: [],
            };
            (props.classificationDefs![classificationId] as ClassificationDefinition).fieldIds.push(fieldId);

            // Focus the "name" input in the last field row for this classification.
            // The setTimeout is because we need to wait for vue to re-render.
            setTimeout(() => {
                let fieldElements = fieldRowElements.value[classificationId];
                (fieldElements[fieldElements.length-1] as any)
                    .$el.getElementsByTagName('input')[0].focus();
            }, 0);
        };
        let deleteField = (classificationId: string, fieldId: string) => {
            if (classificationId && fieldId) {
                let classificationFieldIds = (props.classificationDefs![classificationId] as ClassificationDefinition).fieldIds;
                let index = classificationFieldIds.indexOf(fieldId);
                if (index !== -1) {
                    classificationFieldIds.splice(index, 1);
                }
                delete props.fieldDefs![fieldId];
            }
        };

        let addNewClassification = () => {
            let classificationId = uuidv4();
            (props.classificationDefs![classificationId] as ClassificationDefinition) = {
                id: classificationId,
                name: '',
                fieldIds: [],
            }
            props.classificationIds!.push(classificationId);

            // Focus the "name" input in the last classification.
            // The setTimeout is because we need to wait for vue to re-render.
            setTimeout(() => {
                (classificationElements.value as any)[classificationId].getElementsByTagName('input')[0].focus();
            }, 0);
        };
        let deleteClassification = (classificationId: string) => {
            if (classificationId) {
                let index = props.classificationIds!.indexOf(classificationId);
                if (index !== -1)
                    props.classificationIds!.splice(index, 1);
                delete props.classificationDefs![classificationId];
            }
        };

        // -- Drag and Drop --

        let dragulaComposition = useDragula();

        const classificationWrapper = ref(null);
        let isDraggingField = ref(false);
        let fieldDrake: dragula.Drake | undefined = undefined;
        let classificationDrake: dragula.Drake | undefined = undefined;
        // Wrapped inside "onMounted" because we need to provide dragula with DOM refs
        onMounted(() => {
            // Classification drag-n-drop
            classificationDrake = dragula([classificationWrapper.value as any], {
                mirrorContainer: document.getElementById("mw-dragula-mount")!,
                moves: (el, container, handle) => {
                    let shouldMove = dragulaComposition.wasHandleGrabbed(handle, 'classification-drag-handle');

                    // Collapse the "possible value" pane when a drag event starts
                    if (shouldMove) {
                        expandedPVFieldId.value = undefined;
                        focusedFieldId.value = undefined;
                    }

                    return shouldMove;
                },
            });
            classificationDrake.on('drop', (el, target, source, sibling) => dragulaComposition.dropClassification(el, sibling, (props.classificationIds! as string[])));
            classificationDrake.on('cancel', (el, target, source) => dragulaComposition.cancelClassification(el, (props.classificationIds! as string[])));

            // Field drag-n-drop
            fieldDrake = dragula((fieldLists.value as any), {
                mirrorContainer: document.getElementById("mw-dragula-mount")!,
                moves: (el, container, handle) => {
                    let shouldMove = dragulaComposition.wasHandleGrabbed(handle, 'field-drag-handle');

                    // Collapse the "possible value" pane when a drag event starts
                    if (shouldMove) {
                        expandedPVFieldId.value = undefined;
                        focusedFieldId.value = undefined;
                    }

                    return shouldMove;
                }
            });
            fieldDrake.on('drop', (el, target, source, sibling) => dragulaComposition.dropClassificationField(el, target, source, sibling, (props.classificationDefs! as TypedMap<ClassificationDefinition>)));
            fieldDrake.on('cancel', (el, target, source) => dragulaComposition.cancelClassificationField(el, target, source, (props.classificationDefs! as TypedMap<ClassificationDefinition>)));
            // When dragging fields, sets a min-height for the drop zone in case you want to drop in a list with no fields.
            fieldDrake.on('drag', () => isDraggingField.value = true);
            fieldDrake.on('dragend', () => isDraggingField.value = false);
        });
        // If the user creates a new classification, we need to add its fieldList to dragula so it can accept
        // field drops. For simplicity, we just re-initialize all of fieldDrake's containers.
        onUpdated(() => fieldDrake!.containers = fieldLists.value);

        // Auto-scroll setup
        let scrollAmount = ref(0);
        let editClassificationsDialog = ref(null);
        let checkForVerticalScroll = (mouseEvent: MouseEvent) => {
            if (fieldDrake?.dragging || classificationDrake?.dragging) {
                scrollAmount.value = dragulaComposition.calculateScrollAmount(mouseEvent);
            }
        };
        let scrollTimer = setInterval(() => {
            if ((fieldDrake?.dragging || classificationDrake?.dragging) && scrollAmount.value !== 0) {
                (editClassificationsDialog.value as unknown as HTMLElement).parentElement!.scrollBy({
                    top: scrollAmount.value/5, // "5" is just a magic number that seemed to scale the scroll speed ok.
                });
            }
        }, 20);
        onUnmounted(() => clearInterval(scrollTimer));

        return {
            // Element Refs
            classificationElements, fieldLists, fieldRowElements, addFieldRowElement, classificationWrapper, editClassificationsDialog,

            // User-Input Refs
            hoveredClassification, classificationToDelete,
            hoveredFieldRow, fieldRowToDelete, expandedPVFieldId, focusedFieldId,
            isDraggingField,

            // Data
            originalFieldIds: Object.keys(props.fieldDefs as TypedMap<FieldDefinition>), // Intentionally not reactive - we want to know what the original fields were.

            // Methods
            fieldTypeHasPVs, addNewField, deleteField, addNewClassification, deleteClassification,
            togglePVPaneExpansion: (fieldId: string) => {
                expandedPVFieldId.value = (expandedPVFieldId.value === fieldId) ? undefined : fieldId;
            },

            checkForVerticalScroll,
        }
    }
})
</script>

<style>

#mw-dragula-mount,
.mw-app-actionpane-editclassificationsdialog {
    --deletion-border-thickness: 1px;

    .eic-dialog-section {
        background: var(--gray-very-dark);
        border-radius: var(--dialog-section-radius);
        padding: 10px 0px;
        margin-bottom: var(--dialog-section-gap);

        &.eic-classification-section { padding: 0; }
        .eic-classification-section-content {
            padding: 10px 0;
            border-radius: var(--dialog-section-radius);
            border: var(--deletion-border-thickness) solid transparent;
        }

        &.eic-info-section { color: var(--gray4); }

        .highlight { color: var(--gray8); }

        /* Row styles */
        .eic-header-row {
            h3 { margin: 0; padding: 0; border-bottom: 1px solid var(--gray4); }
            color: var(--gray4);
            text-align: left;
            margin: 15px 0;
        }
        .eic-field-row {
            padding: 5px 0;
            border: var(--deletion-border-thickness) solid transparent; /* Gets turned red when deleting */
            border-radius: 10px;
        }
        .eic-add-field-row {
            padding: 5px 0;
            border: var(--deletion-border-thickness) solid transparent; /* (We don't show deletion on this row ... but this makes the "tree" line up with the rows above. */
            &>* {transition: opacity 0.4s;}
        }
    }

    .eic-add-classification-row {
        padding: 5px 0;
        &>* {transition: opacity 0.4s;}
    }

    .mw-delete-classification {
        position: relative;
        width: 30px;
        height: 30px;
        margin-left: 10px;
        margin-right: -1px; /* A negative margin stops it from popping down to the next line. */
        transition: all 0.2s;
    }

    .eic-padded-row { padding: 0 20px; }

    /* ============= */
    /* Table Styling */
    /* ------------- */

    .deletion-highlight {
        transition: all 0.2s;
        border: var(--deletion-border-thickness) solid var(--red-error) !important;
        background: color-mix(in hsl, var(--red-error) 20%, transparent) !important;
    }
    path.deletion-highlight {
        stroke: var(--red-error) !important;
        fill: color-mix(in hsl, var(--red-error) 20%, transparent) !important;
    }


    .eic-drag-col   { display: inline-block; width: 2.5%;  }
    .eic-table-cols { display: inline-block; width: 97.5%; } /* Comprised of the following 5 columns. */
    /* The below cols should add up to 100% */
    .eic-name-col    { width: 30%; }
    .eic-type-col    { width: 25%; }
    .eic-pv-col      { width: 40%; }
    .eic-delete-col  { width: 5%;  }

    .eic-cell {
        display: inline-block;
        padding: 0 5px;
        vertical-align: middle;
    }

    /* Specific column styles */
    .eic-pv-notapplicable { color: var(--gray4); padding-left: 10px; }
    .eic-delete-col>*     { transition: all 0.2s; }

    .eic-name-col.when-tree-is-displayed {
        display: inline-flex;
        .mw-tree {
            flex: 40px 0 0;
            margin-top: -10px;
            margin-bottom: -10px;

            line {
                stroke: var(--gray2);
                stroke-width: 5px;
            }
        }
    }
}

</style>