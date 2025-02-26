<template>
    <g v-bind:class="{ 'mw-app-relationship-block': true, 'eic-skip-tween': eicSkipTween }"
        v-bind:style="{ transform: `translate(${boundingBox.x}px, ${boundingBox.y}px)` }"
        v-on:mouseenter="mouseEnter"
        v-on:mouseleave="mouseLeave"
        v-on:wheel="updateBodySize()"><!-- You know what would be great? If spinning the mouse wheel while the block was expanding didn't make it forget how to size itself, but noOOOooo. -->

        <!-- The "shadow" -->
        <rect data-test="block"
            class="eic-block-shadow"
            v-bind:rx="(showPreview || isExpanded) ? 8/adjustedScale : (20/adjustedScale)"
            v-bind:class="{ selected: eicBlock.isSelected }"
            v-bind:y="5/adjustedScale"
            v-bind:width="bodySize.width"
            v-bind:height="bodySize.height">
        </rect>
        <!-- The background/border -->
        <rect data-test="block"
            class="eic-block-rect"
            v-bind:rx="(showPreview || isExpanded) ? 8/adjustedScale : (20/adjustedScale)"
            v-bind:class="{ selected: eicBlock.isSelected }"
            v-bind:style="blockStyle"
            v-bind:width="bodySize.width"
            v-bind:height="bodySize.height">
        </rect>

        <!-- The "Locked Open" message -->
        <g v-bind:style="{ transform: `scale(${1/adjustedScale})` }">
            <g class="eic-block-displaying-preview"
                v-bind:class="{ 'is-visible': isExpanded }">
                <rect></rect>
                <text>Locked Open</text>
            </g>
        </g>

        <!-- The block content / body -->
        <foreignObject v-bind:style="{ transform: `scale(${1/adjustedScale})` }"
            v-bind:width="bodySize.width*adjustedScale"
            v-bind:height="bodySize.height*adjustedScale"
            v-on:mousedown="selectIfNotSelected">
            <div ref="blockBody"
                v-bind:class="{ 'mw-body': true, 'mw-scrollbars': true, expanded: showPreview || isExpanded }"
                v-on:dblclick.stop="enterEditMode">

                <!-- Fully expanded, showing all fields/comments/etc -->
                <div v-if="isExpanded">
                    <component class="eic-block-content mw-block-content-section"
                        v-bind:class="{ 'in-edit-mode': inEditMode }"
                        data-test="dynamic-block-content"
                        v-bind:is="contentComponentType"
                        v-bind:block-data="eicBlock.content.data"
                        v-bind:block-style="expandedSummaryStyle"
                        v-bind:style="expandedSummaryStyle"
                        v-bind:in-edit-mode="inEditMode"
                        v-on:editcomplete="exitEditMode"
                        v-on:mousedown="tryToStartDrag"
                        ></component>
                    <eic-expanded-block
                        v-bind:eicBlock="eicBlock"
                        v-bind:isPreview="false"
                        v-on:dblclick.stop
                        v-on:mw-update-size="updateBodySize()"
                        ></eic-expanded-block>
                </div>

                <!-- Expand to show "preview" fields -->
                <div v-else-if="showPreview">
                    <component class="eic-block-content mw-block-content-section"
                        v-bind:class="{ 'in-edit-mode': inEditMode }"
                        data-test="dynamic-block-content"
                        v-bind:is="contentComponentType"
                        v-bind:block-data="eicBlock.content.data"
                        v-bind:style="expandedSummaryStyle"
                        v-bind:block-style="expandedSummaryStyle"
                        v-bind:in-edit-mode="inEditMode"
                        v-on:editcomplete="exitEditMode"
                        v-on:mousedown="tryToStartDrag"
                        ></component>
                    <eic-expanded-block
                        v-bind:eicBlock="eicBlock"
                        v-bind:isPreview="true"
                        v-on:dblclick.stop
                        v-on:mw-update-size="updateBodySize()"
                        ></eic-expanded-block>
                </div>

                <!-- Standard, resizable view -->
                <div v-else class="resize-grid resizable">
                    <div class="resize-handle resize-nw" v-on:mousedown="tryToResize({ mouseEvent: $event, direction: ResizeDirection.NW })"></div>
                    <div class="resize-handle resize-n"  v-on:mousedown="tryToResize({ mouseEvent: $event, direction: ResizeDirection.N })"></div>
                    <div class="resize-handle resize-ne" v-on:mousedown="tryToResize({ mouseEvent: $event, direction: ResizeDirection.NE })"></div>
                    <div class="resize-handle resize-w"  v-on:mousedown="tryToResize({ mouseEvent: $event, direction: ResizeDirection.W })"></div>
                    <div class="resize-content"
                        data-test="block-content"
                        v-on:mousedown="tryToStartDrag">
                        <component class="eic-block-content"
                            data-test="dynamic-block-content"
                            v-bind:is="contentComponentType"
                            v-bind:block-data="eicBlock.content.data"
                            v-bind:block-style="blockStyle"
                            v-bind:in-edit-mode="inEditMode"
                            v-on:editcomplete="exitEditMode"
                            ></component>
                    </div>
                    <div class="resize-handle resize-e"  v-on:mousedown="tryToResize({ mouseEvent: $event, direction: ResizeDirection.E })"></div>
                    <div class="resize-handle resize-sw" v-on:mousedown="tryToResize({ mouseEvent: $event, direction: ResizeDirection.SW })"></div>
                    <div class="resize-handle resize-s"  v-on:mousedown="tryToResize({ mouseEvent: $event, direction: ResizeDirection.S })"></div>
                    <div class="resize-handle resize-se" v-on:mousedown="tryToResize({ mouseEvent: $event, direction: ResizeDirection.SE })" data-test="block-resize-se"></div>
                </div>
            </div>
        </foreignObject>

        <!-- The block tray -->
        <eic-block-tray v-bind:style="{ transform: `scale(${1/adjustedScale}) translate(2px, 2px)` }"
            v-show="!inEditMode"
            v-bind:blockId="eicBlock.id"
            v-bind:blockBoundingBox="boundingBox"
            v-bind:isVisible="isBlockHovered"
            v-bind:isExpanded="isExpanded"
            v-on:blockTrayDragStart="$emit('blockTrayDragStart', $event)"
            v-on:showPreview="showPreview = true"
            v-on:toggleExpansion="toggleExpansion"
            v-on:dblclick.stop
            ></eic-block-tray>
    </g>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, Ref, ref, watch } from "vue";

import { useStore } from "../../store/store";
import { useEmitter } from "../../composables/Emitter";

import { Block, BlockContent, MIN_BLOCK_HEIGHT, MIN_BLOCK_WIDTH } from 'constellation-common/datatypes';
import { RectangleUtils } from 'constellation-common/utilities';
import { ResizeDirection } from "../../composables/Resizable";

import { SetBlockContentAction } from '../../actions/board-actions/SetBlockContent';

export default defineComponent({
    emits: [ 'drag', 'resize', 'blockTrayDragStart', 'mouseEnterBlock', 'mouseLeaveBlock' ],
    props: {
        eicBlock: {
            type: Object,
            required: true,
        },
        eicScale: {
            type: Number, // The canvas zoom scale
            required: true,
        },
        eicTempShift: Object, // {deltaX, deltaY} This gets set while dragging blocks
        eicTempResize: Object, // {deltaX, deltaY, deltaWidth, deltaHeight} This gets set while resizing blocks
        eicSkipTween: Boolean,
        initialHoverState: {
            type: Boolean,
            default: false
        },
        myScale: { // The block depth scale
            type: Number,
            default: 1
        }
    },
    setup(props, context) {
        const store = useStore();

        let emitter = useEmitter();

        const switchCtrlShiftForSelection = computed(() => store.state.generalData.uiFlags.switchCtrlShiftForSelection);
        const treeSelectKey = computed(() => switchCtrlShiftForSelection.value ? 'ctrlKey' : 'shiftKey');
        const addSelectKey = computed(() => switchCtrlShiftForSelection.value ? 'shiftKey' : 'ctrlKey');

        let inEditMode = computed(() => store.state.blockData.blockIdBeingEdited === props.eicBlock!.id)
        let isBlockHovered = ref(props.initialHoverState);

        let contentComponentType = computed(() => {
            switch (props.eicBlock!.content.type) {
                case 'text':
                    return 'eic-text-content'
            }
        });
        let boundingBox = computed(() => {
            let base = {
                x: props.eicBlock!.location.x,
                y: props.eicBlock!.location.y,
                width: props.eicBlock!.location.width,
                height: props.eicBlock!.location.height
            };

            // Make adjustments for any active dragging or resizing
            let zoomScale = (props.eicScale ? props.eicScale : 1);
            if (props.eicBlock!.isSelected) {
                if (props.eicTempShift) {
                    base.x += props.eicTempShift.deltaX / zoomScale;
                    base.y += props.eicTempShift.deltaY / zoomScale;
                }
                if (props.eicTempResize) {
                    base.x += props.eicTempResize.deltaX / zoomScale;
                    base.y += props.eicTempResize.deltaY / zoomScale;
                    base.width += props.eicTempResize.deltaWidth / zoomScale;
                    base.height += props.eicTempResize.deltaHeight / zoomScale;
                }
            }

            // Restrict how small it can appear
            let normalized = RectangleUtils.normalize(base.x, base.y, base.width, base.height);
            let blockDepthScale = props.myScale;
            normalized.width = Math.max(normalized.width, MIN_BLOCK_WIDTH / blockDepthScale);
            normalized.height = Math.max(normalized.height, MIN_BLOCK_HEIGHT / blockDepthScale);

            return normalized;
        });

        // Field preview / expansion
        let showPreview = ref(props.initialHoverState);
        let isExpanded = computed(() => (props.eicBlock as Block).isLockedOpen);
        let blockBody: Ref<undefined | HTMLElement> = reactive(ref(undefined));
        let bodySize = ref({ width: boundingBox.value.width, height: boundingBox.value.height });

        // If it's expanded, we want it to be a fixed size, regardless of depth or the user's zoom level.
        // To do that, we just use the zoom level (eicScale) instead of the depth (myScale) as the scale factor.
        let adjustedScale = computed(() => (showPreview.value || isExpanded.value) ? props.eicScale : props.myScale);

        function updateBodySize() {
            if (showPreview.value || isExpanded.value) {
                setTimeout(() => {
                    if (blockBody.value) {
                        bodySize.value.width = 600 / adjustedScale.value!;
                        bodySize.value.height = blockBody.value!.getBoundingClientRect().height / adjustedScale.value!;
                    }
                }, 0);
            } else {
                bodySize.value.width = boundingBox.value.width;
                bodySize.value.height = boundingBox.value.height;
            }
        }
        // Update the size of the SVG components any time the size of its content changes.
        onMounted(() => {
            let bodyHeight = computed(() => blockBody.value!.getBoundingClientRect().height || 0);
            watch([bodyHeight, showPreview, isExpanded, boundingBox], () => { updateBodySize(); });
            // If the "initialHoverState" is true, we also default "showPreview" to true. This fixes a Chrome
            // problem where something during the render gets delayed ever so slightly, causing this block to
            // not properly refresh and expand. ...but because "showPreview" can start out as true, the above
            // "watch" update never gets initially triggered ...so let's force it.
            if (showPreview.value) {
                updateBodySize();
                // ...but it also bunks up the watch([showPreview, ...]) from triggering below, so let's do
                // that work here too. YAY BAD PROGRAMMING PRACTICES.
                setTimeout(() => updateBodySize(), 250);
                setTimeout(() => updateBodySize(), 500);
            }
        });
        watch([showPreview, isExpanded], (newVal, origVal) => {
            // When an block becomes not expanded, collapse the block. This triggers when the user pushes "space" to open/close their blocks.
            if (origVal[1] && !newVal[1]) {
                showPreview.value = false;
            }
            if (showPreview.value || isExpanded.value) {
                store.dispatch("expandBlock", props.eicBlock!.id);

                // When the block's width grows, its summary text reduces the number of lines it
                // takes up, causing the summary to be a shorter height when fully expanded.
                // Nothing updates the body size based on this, and I'm not sure of a clean way
                // to do it. SO. The animation takes 500ms. We'll also do it once in the middle
                // to make it less noticeable as a separate "post-expansion action".
                setTimeout(() => updateBodySize(), 250);
                setTimeout(() => updateBodySize(), 500);
            } else {
                // Certain input components have save actions based on "onblur" events.
                // If the user leaves "preview" mode, the components never trigger the
                // "onblur", resulting in lost changes. By forcing the blur, it forces
                // the save action.
                if (document.activeElement && document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                }

                // Wait half a second for the "contracting" animation to complete before updating the datastore
                setTimeout(() => {
                    store.dispatch("contractBlock", props.eicBlock!.id);
                }, 500);
            }
        });

        let blockStyle = computed(() => {
            let style = store.getters.getStyles(props.eicBlock as Block, adjustedScale.value!);
            if (showPreview.value || isExpanded.value) {
                return {...style, 'stroke': 'none', 'fill': 'auto' };
            } else {
                return style;
            }
        });
        let expandedSummaryStyle = computed(() => {
            return store.getters.getCssStyles(props.eicBlock as Block, adjustedScale.value!, 3);
        });

        return {
            ResizeDirection,
            inEditMode,
            isBlockHovered,
            blockBody,

            // Field preview / expansion
            showPreview, isExpanded, updateBodySize,

            // -- Computed Properties --
            contentComponentType,
            blockStyle, expandedSummaryStyle,
            boundingBox, bodySize,
            adjustedScale,

            // This is for when the user begins to drag a not-selected block. We want to select it and drag it,
            // but only if it's not selected. If it _is_ selected, we want to avoid clearing all the other
            // selected blocks.
            selectIfNotSelected: (mouseEvent: MouseEvent) => {
                if (mouseEvent.button === 0 && !props.eicBlock!.isSelected) {
                    const shouldSelectTree = treeSelectKey.value === 'ctrlKey'
                        ? mouseEvent.ctrlKey || mouseEvent.metaKey // "metaKey" is "cmd" for Mac
                        : mouseEvent.shiftKey;
                    const shouldKeepSelection = addSelectKey.value === 'ctrlKey'
                        ? mouseEvent.ctrlKey || mouseEvent.metaKey // "metaKey" is "cmd" for Mac
                        : mouseEvent.shiftKey;

                    if (shouldSelectTree) {
                        let blockIds = store.getters.getTransitiveDescendants(props.eicBlock!.id);
                        store.dispatch("selectBlocks", {
                            blockIds,
                            clearCurrentSelection: !shouldKeepSelection,
                        });
                    } else {
                        store.dispatch("selectBlock", {
                            blockId: props.eicBlock!.id,
                            clearCurrentSelection: !shouldKeepSelection
                        });
                    }
                }
            },
            toggleExpansion: () => {
                store.dispatch("lockOpenClosed", {blockIds: [props.eicBlock!.id]});
            },
            tryToStartDrag: (mouseEvent: MouseEvent) => {
                if (mouseEvent.button === 0 && !inEditMode.value) {
                    store.dispatch('setDisablePointerEvents', true);
                    context.emit('drag', {mouseEvent, blockId: props.eicBlock!.id});
                }
            },
            tryToResize: (resizeEvent: any) => {
                store.dispatch('setDisablePointerEvents', true);
                context.emit('resize', resizeEvent);
            },
            enterEditMode: (mouseEvent: MouseEvent) => {
                store.dispatch('startEditingBlock', props.eicBlock!.id);
            },
            exitEditMode: ({cancelled, editEvent}: { cancelled: boolean, editEvent: BlockContent }) => {
                if (JSON.stringify(props.eicBlock!.content) !== JSON.stringify(editEvent)) {
                    new SetBlockContentAction(props.eicBlock!.id, editEvent).submit();
                }
                store.dispatch('stopEditingBlock');
                emitter.emit('blockEditComplete', {newContents: editEvent, cancelled});
            },
            mouseEnter: (mouseEvent: MouseEvent) => {
                isBlockHovered.value = true;
                context.emit('mouseEnterBlock', props.eicBlock!.id);
            },
            mouseLeave: (mouseEvent: MouseEvent) => {
                context.emit('mouseLeaveBlock', props.eicBlock!.id);
                isBlockHovered.value = false;
                showPreview.value = false;
            },
        }
    },
})
</script>

<style>

.mw-app-relationship-block {

    /* Animate the blocks into position */
    transition: all 0.5s;
    /* Expand/contract the block */
    rect,foreignObject { transition: width 0.5s, height 0.5s; }
    &.eic-skip-tween {
        transition: none;
        rect,foreignObject { transition: none; }
    }

    .eic-block-shadow {
        fill: var(--gray-very-dark);
        transition: fill 0.2s, width 0.5s, height 0.5s;
        &.selected {
            fill: var(--gray-very-light);
        }
    }
    .eic-block-rect {
        stroke: var(--gray3);
        fill: var(--gray-very-dark);
    }

    .eic-block-displaying-preview {
        --width: 100px;
        --height: 25px;
        opacity: 0;
        transition: transform 0.2s, opacity 0.2s;
        &.is-visible {
            transform: translate(5px, calc(5px - var(--height)));
            opacity: 1;
        }
        transform: translateX(5px);
        rect {
            rx: 5px;
            width: var(--width);
            height: var(--height);
            fill: var(--pink-medium);
        }
        text {
            transform: translate(calc(var(--width) / 2), calc(var(--height) / 2));
            text-anchor: middle;       /* Center horizontally */
            dominant-baseline: middle; /* Center vertically */
            fill: var(--gray-very-dark);
            font-weight: bold;
        }
    }

    .mw-body {
        width: 100%;
        height: 100%;
        background: none;
        &.expanded {
            overflow-x: hidden;
            height: auto;
            background: var(--pink-purp-gradient);
            border-radius: var(--dialog-section-radius);
        }

        .resize-grid {
            width: 100%;
            height: 100%;

            display: grid;
            grid-template-columns: 10px 1fr 10px;
            grid-template-rows: 10px 1fr 10px;

            &.resizable {
                .resize-nw { cursor: nwse-resize; }
                .resize-n  { cursor: ns-resize;   }
                .resize-ne { cursor: nesw-resize; }
                .resize-w  { cursor: ew-resize;   }
                .resize-e  { cursor: ew-resize;   }
                .resize-sw { cursor: nesw-resize; }
                .resize-s  { cursor: ns-resize;   }
                .resize-se { cursor: nwse-resize; }
            }

            /* Without this, the content can cover the resize handles if the content is too big */
            .resize-handle { z-index: 1; }
        }
    }

    .mw-block-content-section {
        margin: var(--dialog-section-gap);
        border-radius: var(--dialog-section-radius);
        background: var(--gray-very-dark);
        padding: 20px 30px;

        &.in-edit-mode {
            padding: 10px;
            textarea { height: 100px; }
        }

        pre {
            position: relative;
            top: auto;
            left: auto;
            transform: none;
        }
    }

}
</style>
