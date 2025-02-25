<template>
    <div class="mw-app-actionpane-possiblevaluepane"
        v-on:mousemove="checkForVerticalScroll"
        v-on:mouseover="pvPaneHovered = fieldDef.id"
        v-on:mouseleave="pvPaneHovered = undefined">
        <div class="eic-pointer-up-bounds"><div class="eic-pointer-up"></div></div>
        <div 
            ref="pvContentPane"
            v-on:scroll="updateScrollY"
            v-bind:class="{
                'eic-pv-pane-content': true,
                'mw-scrollbars': true,
                'style-for-deletion': styleForFieldDeletion,
            }">
            <svg v-bind:viewBox="svgViewBox"
                v-show="fieldDef.possibleValueIds?.length > 0"
                v-bind:style="{ 'height': `${pvPaneContentScrollSize.height}px` }">
                <path v-bind:d="pathPoints" v-bind:class="{ 'deletion-highlight': pvToDelete }" />
            </svg>

            <div class="eic-pv-edit-list">
                <div ref="pvListWrapper">
                    <!-- NOTE: Some styles are defined inline for these draggable elements because dragula mirrors the ghost copies
                            at the root of the document, resulting in the loss of their styles given by their classes. -->
                    <div class="mw-pv-list-item" style="display: flex"
                        v-for="(pvId, pvIndex) of fieldDef.possibleValueIds" v-bind:key="pvId"
                        v-bind:mw-pv-id="pvId"
                        :ref="el => { if (el) pvTextboxContainer[pvId] = el }"
                        v-on:mouseenter="hoveredPVId = pvId"
                        v-on:mouseleave="hoveredPVId = undefined">
                        <eic-svg-draghandle width="20px" class="pv-drag-handle" v-bind:style="{ opacity: hoveredPVId === pvId ? 1 : 0, 'flex-basis': '25px', 'margin-left': '15px' }"></eic-svg-draghandle>
                        <eic-textbox v-model="possibleValueDefs[pvId].name"
                            v-on:eic-focus="selectedPVId = pvId"
                            eic-placeholder="Possible Value"
                            :ref="el => { if (el) pvTextboxes[pvIndex] = el }"
                            ></eic-textbox>
                    </div>
                </div>

                <!-- NOTE: Some styles are defined inline for these draggable elements because dragula mirrors the ghost copies
                        at the root of the document, resulting in the loss of their styles given by their classes. -->
                <div class="mw-pv-list-item" style="display: flex">
                    <div class="pv-drag-handle" style="flex-basis: 25px; margin-left: 15px;"></div> <!-- Just a spacer -->
                    <eic-textbox class="eic-add-pv-textbox" v-bind:mw-phantom="true" eic-placeholder="+ Add Value" v-on:eic-focus="addNewPossibleValue()"></eic-textbox>
                </div>
            </div>

            <div class="eic-pv-style-editor" ref="pvStyleEditor"
                v-bind:style="{ 'transform': styleEditorTransformation }"
                v-show="fieldDef.possibleValueIds?.length > 0">
                <div class="eic-pv-style-editor-wrapper">
                    <eic-style-editor v-if="selectedPVId"
                        v-bind:eic-project-colors="[]"
                        v-bind:eic-board-colors="boardColors"
                        v-bind:eic-border-color="possibleValueDefs[selectedPVId].style?.border"
                        v-bind:eic-background-color="possibleValueDefs[selectedPVId].style?.background"
                        v-bind:eic-text-color="possibleValueDefs[selectedPVId].style?.text"
                        v-on:mw-color-changed="setPVColor(selectedPVId, $event.id, $event.color)"
                        ></eic-style-editor>
                </div>
                <div class="eic-delete-col">
                    <eic-svg-deletion-x
                        v-on:mouseover="pvToDelete = selectedPVId"
                        v-on:mouseleave="pvToDelete = undefined"
                        v-bind:style="{ opacity: pvPaneHovered === fieldDef.id ? 1 : 0 }"
                        v-on:click="deletePV(selectedPVId)"></eic-svg-deletion-x>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUpdate, onMounted, onUnmounted, reactive, Ref, ref, watch, watchEffect } from "vue";
import { v4 as uuidv4 } from 'uuid';
import dragula from 'dragula';

import { useStore } from "../../../store/store";
import { FieldDefinition, PossibleValueDefinition, TypedMap } from 'constellation-common/datatypes';

import { useDragula } from './DragulaComposition';

export default defineComponent({
    props: {
        possibleValueDefs: Object,
        fieldDef: Object,
        styleForFieldDeletion: Boolean,
    },
    setup(props, context) {
        const store = useStore();

        let fieldId = computed(() => (props.fieldDef! as FieldDefinition).id);

        // -- Element Refs --

        let pvContentPane: Ref<any> = reactive(ref(null));
        let pvTextboxContainer: Ref<TypedMap<any>> = ref({}); // pvId --> pvTextboxContainerElement
        let pvTextboxes: Ref<any[]> = ref([]); // fieldId --> possibleValueTextboxElement[]
        let pvStyleEditor = ref(undefined);
        // Need to reset the refs before each update
        // (see: https://v3.vuejs.org/guide/composition-api-template-refs.html#usage-inside-v-for)
        onBeforeUpdate(() => {
            pvTextboxContainer.value = {};
            pvTextboxes.value = [];
        });

        // -- Possible Value Operations --

        let selectedPVId: Ref<string | undefined> = ref(undefined); // When a user is editing a PV name, this gets set to that PV's id
        let addNewPossibleValue = () => {
            let possibleValue: PossibleValueDefinition = reactive({ id: uuidv4(), name: '', });
            (props.fieldDef! as FieldDefinition).possibleValueIds.push(possibleValue.id);
            (props.possibleValueDefs! as TypedMap<PossibleValueDefinition>)[possibleValue.id] = possibleValue;

            // Focus the "name" input in the last "possible value" row.
            // The setTimeout is because we need to wait for vue to re-render.
            setTimeout(() => {
                (pvTextboxes.value[pvTextboxes.value.length-1] as any).$el.getElementsByTagName('input')[0].focus();
            }, 0);
        };
        let deletePV = (pvId: string) => {
            if (pvId) {
                // Remove from the field
                let field: FieldDefinition = props.fieldDef! as FieldDefinition;
                if (field) {
                    let index = field.possibleValueIds?.indexOf(pvId);
                    if (index !== undefined && index !== -1) {
                        field.possibleValueIds!.splice(index, 1);
                    }

                    // Update the selected PVId
                    if (pvId === selectedPVId.value) { // This should always be true.
                        if (field.possibleValueIds.length > 0) {
                            selectedPVId.value = field.possibleValueIds[Math.min(index, field.possibleValueIds.length-1)];
                        } else {
                            selectedPVId.value = undefined;
                        }
                    }
                }

                // Remove from definition map
                delete props.possibleValueDefs![pvId];
            }
        };
        let setPVColor = (pvId: string, styleKey: string, color: string | undefined) => {
            let pvDef = props.possibleValueDefs![pvId];
            if (pvDef) {
                if (!pvDef.style) pvDef.style = {};

                if (color) pvDef.style[styleKey] = color;
                else       delete pvDef.style[styleKey];
            }
        };

        // -- "Recent Colors" Picker --

        let boardColors = computed(() => {
            // Join the saved ones with any others on the currently-being-modified field definitions
            let allBoardColors: Set<string> = new Set(store.getters.boardColors);
            Object.values(props.possibleValueDefs!).forEach(pv => {
                if (pv.style) {
                    Object.values(pv.style).forEach(value => {
                        if (typeof value === 'string')
                            allBoardColors.add(value);
                    });
                }
            });
            return [...allBoardColors];
        });

        // -- Content Pane Visuals --

        let pvToDelete = ref(undefined); // When a "deletion x" is hovered, this gets set to that pv id
        let pvPaneHovered = ref(undefined); // When the pv edit pane is hovered, this gets set to that field id
        let pvPaneContentScrollY = ref(0); // Distance that the possible value content pane is scrolled
        let pvPaneContentScrollSize = ref({ width: 0, height: 0 });
        let updateScrollY = (event: any) => { pvPaneContentScrollY.value = event.target.scrollTop; }
        let updateScrollSize = () => {
            if (fieldId.value) {
                let scrollHeight = pvContentPane.value?.scrollHeight;
                let scrollWidth  = pvContentPane.value?.scrollWidth;
                if (scrollHeight) pvPaneContentScrollSize.value.height = scrollHeight;
                if (scrollWidth)  pvPaneContentScrollSize.value.width  = scrollWidth;
            }
        };
        watchEffect(() => {
            updateScrollSize(); // This one's needed for the watchEffect to properly watch things.
            setTimeout(updateScrollSize, 100); // ...and this one's needed because I don't know.
        });

        // -- SVG Border Path --

        interface Point { x: number, y: number };
        interface SurroundingPoints { before: Point, current: Point, after: Point };
        let pathPoints = ref("");
        let updatePathPoints = () => {
            let pvId = selectedPVId.value;
            let scrollY = pvPaneContentScrollY.value;

            if (fieldId.value === undefined || pvId === undefined || scrollY === undefined)
                return;

            // 1. Get all of our bounding boxes
            let pvTextboxEle = pvTextboxContainer.value[pvId];
            let styleEditorEle = pvStyleEditor.value as unknown as HTMLElement;

            let pvTextboxRelativeBB: any = undefined;
            let styleEditorRelativeBB: any = undefined;
            if (pvTextboxEle && styleEditorEle) {
                // Possible Value Textbox
                let pvTextboxBB = pvTextboxEle.getBoundingClientRect();
                let pvTextboxParentBB = pvTextboxEle.offsetParent?.getBoundingClientRect();
                if (pvTextboxParentBB) {
                    pvTextboxRelativeBB = {
                        x: pvTextboxBB.x - pvTextboxParentBB.x + 20,
                        y: pvTextboxBB.y - pvTextboxParentBB.y + 14,
                        width: pvTextboxBB.width + 10,
                        height: pvTextboxBB.height + 2,
                    }
                }

                // Style Editor
                let styleEditorBB = styleEditorEle.getBoundingClientRect();
                let styleEditorParentBB = styleEditorEle.offsetParent?.getBoundingClientRect();
                if (styleEditorParentBB) {
                    styleEditorRelativeBB = {
                        x: styleEditorBB.x - styleEditorParentBB.x + 40,
                        y: scrollY + 14,
                        width: styleEditorBB.width - 30,
                        height: styleEditorBB.height - 15,
                    }
                }
            }

            // 3. Combine into one polygon
            // There are 3 rectangles: the PV textbox, the style editor, and a skinny tall one that connects them.
            let points: Point[] = [];
            if (styleEditorRelativeBB && pvTextboxRelativeBB) {
                // Style Editor (top-left, top-right, bottom-right, bottom-left points)
                points.push({ x: styleEditorRelativeBB.x,                               y: styleEditorRelativeBB.y });
                points.push({ x: styleEditorRelativeBB.x + styleEditorRelativeBB.width, y: styleEditorRelativeBB.y });
                points.push({ x: styleEditorRelativeBB.x + styleEditorRelativeBB.width, y: styleEditorRelativeBB.y + styleEditorRelativeBB.height });
                points.push({ x: styleEditorRelativeBB.x,                               y: styleEditorRelativeBB.y + styleEditorRelativeBB.height });
                // Skinny Tall Connector (bottom-right, bottom-left points)
                let bottom = Math.max(pvTextboxRelativeBB.y + pvTextboxRelativeBB.height, styleEditorRelativeBB.y + styleEditorRelativeBB.height);
                points.push({ x: styleEditorRelativeBB.x,                           y: bottom });
                points.push({ x: pvTextboxRelativeBB.x + pvTextboxRelativeBB.width, y: bottom });
                // PV Textbox (bottom-right, bottom-left, top-left, top-right)
                points.push({ x: pvTextboxRelativeBB.x + pvTextboxRelativeBB.width, y: pvTextboxRelativeBB.y + pvTextboxRelativeBB.height });
                points.push({ x: pvTextboxRelativeBB.x,                             y: pvTextboxRelativeBB.y + pvTextboxRelativeBB.height });
                points.push({ x: pvTextboxRelativeBB.x,                             y: pvTextboxRelativeBB.y });
                points.push({ x: pvTextboxRelativeBB.x + pvTextboxRelativeBB.width, y: pvTextboxRelativeBB.y });
                // Skinny Tall Connector (top-left, top-right points)
                let top = Math.min(pvTextboxRelativeBB.y, styleEditorRelativeBB.y);
                points.push({ x: pvTextboxRelativeBB.x + pvTextboxRelativeBB.width, y: top });
                points.push({ x: styleEditorRelativeBB.x,                           y: top });
            }

            if (points.length > 0) {
                // 4. Reduce down into our SVG string
                // Reduce into an array of triplets, each point having it's two surrounding points.
                let pointTriplets: SurroundingPoints[] = [];
                for (let index = 0; index < points.length; index++) {
                    // Ignore consecutive duplicate points - can happen at the "connector" rectangle
                    if (index !== 0
                        && points[index].x === points[index-1].x
                        && points[index].y === points[index-1].y)
                        continue;

                    pointTriplets.push({
                        before: (index === 0) ? points[points.length-1] : points[index-1],
                        current: points[index],
                        after: (index === points.length-1) ? points[0] : points[index+1]
                    });
                }
                pointTriplets.push(pointTriplets[0]); // Connect back at start

                const cornerRadius = 10;
                const diffNeededForCorner = 15;
                pathPoints.value = pointTriplets.reduce((prev, {before, current, after}) => {
                    // A rx ry x-axis-rotation large-arc-flag sweep-flag x y

                    if (prev === "") {
                        prev += `M ${current.x + cornerRadius} ${current.y} `;
                    } else {
                        // Before & Current points determine the line.
                        // Current & After points determine the arc.

                        // Left to right
                        if (before.y === current.y && before.x < current.x) {
                            prev += `L ${current.x - Math.min(cornerRadius, Math.abs(before.x - current.x))} ${current.y} `;
                            // Curves downwards or curves upwards?
                            if      (after.y - current.y > diffNeededForCorner) prev += `A ${cornerRadius} ${cornerRadius} 0 0 1 ${current.x} ${current.y + cornerRadius} `;
                            else if (current.y - after.y > diffNeededForCorner) prev += `A ${cornerRadius} ${cornerRadius} 0 0 0 ${current.x} ${current.y - cornerRadius} `;
                        }
                        // Top to bottom
                        else if (before.x === current.x && before.y < current.y) {
                            prev += `L ${current.x} ${current.y - Math.min(cornerRadius, Math.abs(before.y - current.y))} `;
                            // Curves right or curves left?
                            if      (after.x - current.x > diffNeededForCorner) prev += `A ${cornerRadius} ${cornerRadius} 0 0 0 ${current.x + cornerRadius} ${current.y} `;
                            else if (current.x - after.x > diffNeededForCorner) prev += `A ${cornerRadius} ${cornerRadius} 0 0 1 ${current.x - cornerRadius} ${current.y} `;
                        }
                        // Right to left
                        else if (before.y === current.y && before.x > current.x) {
                            prev += `L ${current.x + Math.min(cornerRadius, Math.abs(before.x - current.x))} ${current.y} `;
                            // Curves downwards or curves upwards?
                            if      (after.y - current.y > diffNeededForCorner) prev += `A ${cornerRadius} ${cornerRadius} 0 0 0 ${current.x} ${current.y + cornerRadius} `;
                            else if (current.y - after.y > diffNeededForCorner) prev += `A ${cornerRadius} ${cornerRadius} 0 0 1 ${current.x} ${current.y - cornerRadius} `;
                        }
                        // Bottom to top
                        else if (before.x === current.x && before.y > current.y) {
                            prev += `L ${current.x} ${current.y + Math.min(cornerRadius, Math.abs(before.y - current.y))} `;
                            // Curves right or curves left?
                            if      (after.x - current.x > diffNeededForCorner) prev += `A ${cornerRadius} ${cornerRadius} 0 0 1 ${current.x + cornerRadius} ${current.y} `;
                            else if (current.x - after.x > diffNeededForCorner) prev += `A ${cornerRadius} ${cornerRadius} 0 0 0 ${current.x - cornerRadius} ${current.y} `;
                        }
                    }
                    return prev;
                }, "");
                pathPoints.value += pathPoints.value = " z";
            }

            // 5. Cry hysterically
        }
        watch([pvPaneContentScrollY, pvPaneContentScrollSize], (newValues, prevValues) => {
            updatePathPoints();
        });
        watch([fieldId, selectedPVId], (newValues, prevValues) => {
            // Need to wait for the slide-open transition to complete before interrogating HTML elements
            let sleepTime = (prevValues[0] === undefined || prevValues[1] === undefined) ? 500 : 0;
            setTimeout(() => updatePathPoints(), sleepTime);
        });
        onMounted(() => {
            pvPaneContentScrollY.value = 0;
            pvPaneContentScrollSize.value.height = 0;
            pvPaneContentScrollSize.value.width  = 0;

            if (pvTextboxes.value?.length > 0) {
                // Try to focus the first PV (if there is one)
                (pvTextboxes.value[0] as any).$el.getElementsByTagName('input')[0].focus();
            } else {
                // Let's be helpful and make one!
                addNewPossibleValue();
            }
        });

        // -- Drag and Drop --

        let dragulaComposition = useDragula();

        let pvListWrapper = ref(null);
        let hoveredPVId = ref(undefined);
        let pvDrake: dragula.Drake | undefined = undefined;
        // Wrapped inside "onMounted" because we need to provide dragula with DOM refs
        onMounted(() => {
            pvDrake = dragula([pvListWrapper.value as any], {
                mirrorContainer: document.getElementById("mw-dragula-mount")!,
                moves: function (el, container, handle) {
                    return dragulaComposition.wasHandleGrabbed(handle, 'pv-drag-handle');
                }
            });
            pvDrake.on('drop', (el, target, source, sibling) => {
                dragulaComposition.dropPossibleValue(el, sibling, (props.fieldDef! as FieldDefinition), selectedPVId, updatePathPoints, pvTextboxContainer);
            });
            pvDrake.on('cancel', (el, container, source) => {
                dragulaComposition.cancelPossibleValue(el, (props.fieldDef! as FieldDefinition), selectedPVId, updatePathPoints, pvTextboxContainer);
            });
        });

        // Auto-scroll setup
        let scrollAmount = ref(0);
        let checkForVerticalScroll = (mouseEvent: MouseEvent) => {
            if (pvDrake?.dragging) {
                scrollAmount.value = dragulaComposition.calculateScrollAmount(mouseEvent);
            }
        };
        let scrollTimer = setInterval(() => {
            if (pvDrake?.dragging && scrollAmount.value !== 0) {
                (pvContentPane.value as unknown as HTMLElement).scrollBy({
                    top: scrollAmount.value/10, // "10" is just a magic number that seemed to scale the scroll speed ok.
                });
            }
        }, 20);
        onUnmounted(() => clearInterval(scrollTimer));

        return {
            // Element Refs
            pvContentPane,
            pvTextboxContainer,
            pvTextboxes,
            pvListWrapper,
            pvStyleEditor,

            // "Other" Refs
            selectedPVId,
            pvPaneHovered,
            pvToDelete,
            hoveredPVId,

            // "Computed"ish Props
            pathPoints,
            boardColors,
            svgViewBox: computed(() => `0 0 ${pvPaneContentScrollSize.value.width} ${pvPaneContentScrollSize.value.height}`),
            styleEditorTransformation: computed(() => `translateY(${pvPaneContentScrollY.value}px)`),
            pvPaneContentScrollSize,

            // Methods
            addNewPossibleValue,
            deletePV,
            setPVColor,
            updateScrollY,
            checkForVerticalScroll,
        }
    },
})
</script>

<style>

.mw-dragula-mount,
.mw-app-actionpane-possiblevaluepane {
    --pane-height: 200px;
    --arrow-size: 20px;

    position: relative;

    /* This is to make this section go all the way to the left/right edges. */
    margin-left: -(var(--deletion-border-thickness));
    margin-right: -(var(--deletion-border-thickness));

    /* Slide open */
    overflow: hidden;
    height: var(--pane-height);
    &.pv-slide-open-enter-active,&.pv-slide-open-leave-active { transition: height 0.4s; }
    &.pv-slide-open-enter-from,&.pv-slide-open-leave-to       { height: 0; }

    .eic-pv-pane-content {
        --pvpanecontent-horiz-padding: 20px;
        --pvpanecontent-vert-padding: 10px;

        padding: var(--pvpanecontent-vert-padding) var(--pvpanecontent-horiz-padding);
        height: calc(var(--pane-height) - var(--arrow-size));
        position: relative;
        overflow-y: auto;

        background: var(--gray-dark);
        border-top: 1px solid var(--gray3);
        border-bottom: 1px solid var(--gray3);

        /*
         * To make this pane not show up on top of the deletion border, we need to
         * set the left/right edges of this border to match either this pane's background
         * (to blend in), or the deletion border (...also to blend in).
         */
        border-left: var(--deletion-border-thickness) solid var(--gray-dark);
        border-right: var(--deletion-border-thickness) solid var(--gray-dark);
        &.style-for-deletion {
            transition: all 0.2s;
            border-left: var(--deletion-border-thickness) solid var(--red-error);
            border-right: var(--deletion-border-thickness) solid var(--red-error);
        }

        .eic-pv-edit-list {
            display: inline-block;
            width: 30%;
            position: relative;
            margin-top: 5px;

            .mw-textbox {
                margin-left: 5px;
                padding: 5px;
            }
        }
        .eic-pv-style-editor {
            display: inline-block;
            width: 70%;
            vertical-align: top;
            position: relative;

            .eic-pv-style-editor-wrapper { display: inline-block; width: 95%; }
            .eic-delete-col              { display: inline-block; width: 5%;  }

            .mw-svg-deletionx>line       { stroke: var(--gray4); }
            .mw-svg-deletionx:hover>line { stroke: var(--gray-dark); }
        }

        &>svg {
            position: absolute;
            margin: calc(-1 * var(--pvpanecontent-vert-padding)) calc(-1 * var(--pvpanecontent-horiz-padding));
            width: 100%;
            pointer-events: none;

            path {
                fill: var(--gray-dark);
                stroke: var(--gray-very-dark);
                filter: drop-shadow(0px 6px 4px var(--gray-very-dark));
            }
        }
    }

    .eic-pointer-up-bounds {
        overflow: hidden;
        margin-bottom: -1px;
        height: var(--arrow-size);
        width: 100%;
        .eic-pointer-up {
            background: var(--gray-dark);
            border-top: 1px solid var(--gray3);
            border-right: 1px solid var(--gray3);
            width: var(--arrow-size);
            height: var(--arrow-size);
            transform: translate(550px, calc(var(--arrow-size) / 2)) rotate(-45deg);
            position: relative;
            z-index: 1;
        }
    }
}

</style>
