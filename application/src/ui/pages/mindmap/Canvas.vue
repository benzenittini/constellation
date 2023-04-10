<template>
    <svg data-test="block-canvas"
        ref="blockCanvas"
        class="mw-app-relationship-canvas"
        v-bind:class="{ 'creating-bulk': blockTrayLinking.isDragging && ctrlHeld }"
        v-on:wheel.prevent="tweenGroup.stopGroup(), pannable.wheel($event), zoomable.wheel($event)"
        v-on:mousedown.self="mouseDown($event)"
        v-on:mousemove="mouseMove($event)"
        v-on:mouseup="completeDraggableActions($event)"
        v-on:dblclick="createNewBlock"
        v-on:contextmenu="$event.preventDefault()"> <!-- Prevents right-click menu showing up on the canvas when user tries right-click dragging. -->

        <rect x="0" y="0" width="0" height="0" fill="none" v-bind:style="{ opacity: spazboxOpacity }"></rect>

        <!-- Everything that gets scaled goes in here -->
        <g data-test="canvas-contents" class="eic-canvas-group"
            v-bind:style="{ transform: `${pannable.translateString} ${zoomable.scaleString}` }">

            <!-- All of our "snap zones" get painted first. -->
            <circle class="mwe-snap-zone"
                v-for="zone in snapZones"
                v-bind:key="zone.key"
                v-bind:cx="zone.x"
                v-bind:cy="zone.y"
                v-bind:r="20/zone.scale"/>

            <!-- When linking blocks using the block tray, this draws the line the user's dragging. -->
            <eic-link data-test="block-canvas-active-link"
                v-if="blockTrayLinking.isDragging"
                v-bind:eic-skip-tween="true"
                v-bind:eic-scale="zoomScale"
                v-bind:my-depth-scale="blockScales[blockTrayLinking.metadata.data.sourceBlockId]"
                v-bind:source="linkStart"
                v-bind:destination="linkDestination"
                v-bind:temp-shift="blockDragDestination"
                v-bind:temp-resize="blockResizable.deltaDrag"></eic-link>

            <eic-link v-for="link in links"
                v-bind:key="link.id"
                v-bind:eic-skip-tween="blockDraggable.isDragging || blockResizable.isDragging"
                v-bind:eic-scale="zoomScale"
                v-bind:my-depth-scale="blockScales[link.source.blockId]"
                v-bind:source="link.source"
                v-bind:destination="link.destination"
                v-bind:temp-shift="blockDragDestination"
                v-bind:temp-resize="blockResizable.deltaDrag"></eic-link>

            <!-- Render a "ghost block" when the user is creating a child block. -->
            <eic-block v-if="blockTrayLinking.isDragging && blockTrayLinking.metadata.data.type === 'setCreateChild' && blockUnderMouse === undefined"
                v-bind:id="ghostBlock.block.id"
                v-bind:key="ghostBlock.block.id"
                v-bind:eic-block="ghostBlock.block"
                v-bind:eic-scale="zoomScale"
                v-bind:my-scale="ghostBlock.scale"
                v-bind:eic-skip-tween="true"
                ></eic-block>
            <!-- Render visible blocks that _aren't_ expanded. Rendering these first so they're "below" the expanded blocks. -->
            <eic-block v-for="blockId of nonExpandedBlockIds"
                v-bind:id="blockId"
                v-bind:key="blockId"
                v-bind:eic-block="blocks[blockId]"
                v-bind:eic-scale="zoomScale"
                v-bind:eic-temp-shift="blockDragDestination"
                v-bind:eic-temp-resize="blockResizable.deltaDrag"
                v-bind:eic-skip-tween="blockDraggable.isDragging || blockResizable.isDragging"
                v-bind:my-scale="blockScales[blockId]"
                v-on:drag="startBlockDrag($event.mouseEvent, { blockId: $event.blockId })"
                v-on:resize="blockResizable.mouseDown($event.mouseEvent, $event.direction)"
                v-on:blockTrayDragStart="beginBlockTrayLinking($event.mouseEvent, $event.metadata)"
                v-on:mouseEnterBlock="mouseEnterBlock"
                v-on:mouseLeaveBlock="mouseLeaveBlock"
                ></eic-block>
            <!-- Render any blocks that are expanded. This makes them appear on top of other blocks. -->
            <eic-block v-for="blockId of expandedBlockIds"
                v-bind:id="blockId"
                v-bind:key="blockId"
                v-bind:initial-hover-state="true"
                v-bind:eic-block="blocks[blockId]"
                v-bind:eic-scale="zoomable.scale"
                v-bind:eic-temp-shift="blockDragDestination"
                v-bind:eic-temp-resize="blockResizable.deltaDrag"
                v-bind:eic-skip-tween="blockDraggable.isDragging || blockResizable.isDragging"
                v-bind:my-scale="blockScales[blockId]"
                v-on:drag="startBlockDrag($event.mouseEvent, { blockId: $event.blockId })"
                v-on:resize="blockResizable.mouseDown($event.mouseEvent, $event.direction)"
                v-on:blockTrayDragStart="beginBlockTrayLinking($event.mouseEvent, $event.metadata)"
                v-on:mouseEnterBlock="mouseEnterBlock"
                v-on:mouseLeaveBlock="mouseLeaveBlock"
                ></eic-block>

            <text v-if="Object.keys(blocks).length === 0" class="canvas-welcome-text" text-anchor="middle" x="0" y="0">Double-click anywhere to get started</text>
        </g>

        <!-- The user's selection box when doing a drag-to-select -->
        <rect class="selection-box"
            v-if="selectionDraggable.isDragging"
            v-bind:x="selectionDraggable.boundingBox.x"
            v-bind:y="selectionDraggable.boundingBox.y"
            v-bind:width="selectionDraggable.boundingBox.width"
            v-bind:height="selectionDraggable.boundingBox.height"></rect>
    </svg>
</template>

<script lang="ts">
import { computed, ref, reactive, defineComponent, onMounted, provide, watch, onUnmounted, Ref } from "vue";

import { useStore } from "../../store/store";
import { useDraggable } from '../../composables/Draggable';
import { useResizable } from '../../composables/Resizable';
import { usePannable } from '../../composables/Pannable';
import { useZoomable } from '../../composables/Zoomable';
import { useEmitter } from "../../composables/Emitter";
import { useWindowEvents } from "../../composables/WindowEvents";
import { useMouseSampler } from "../../composables/MouseSampler";
import { useTweenGroup } from "../../composables/TweenGroup";

import { Block, BlockContent, DEFAULT_BLOCK_HEIGHT, DEFAULT_BLOCK_WIDTH, MIN_BLOCK_HEIGHT, MIN_BLOCK_WIDTH, BoundingBox } from 'constellation-common/datatypes';
import { ArrayUtils, RectangleUtils } from 'constellation-common/utilities';

import { CreateBlockAction } from '../../actions/board-actions/CreateBlock';
import { SetBlockPositionsAction } from '../../actions/board-actions/SetBlockPositions';
import { DeleteBlocksAction } from '../../actions/board-actions/DeleteBlocks';
import { SetBlockParentAction } from '../../actions/board-actions/SetBlockParent';

export default defineComponent({
    props: {},
    setup(props, context) {
        const store = useStore();

        let blocks = computed(() => store.getters.visibleBlocks);
        let links = computed(() => store.getters.visibleHierarchyLinkPairs);
        let expandedBlockIds = computed(() => store.getters.expandedBlockIds);

        let selectionDraggable = useDraggable(); // The "drag box to select blocks" feature
        let blockTrayLinking = useDraggable();  // For creating all link types (regular and hierarchical)
        let blockDraggable = useDraggable();    // Moving selected blocks
        let blockResizable = useResizable();    // Resizing selected blocks

        const addSelectKey = computed(() => store.state.generalData.uiFlags.switchCtrlShiftForSelection ? 'shiftKey' : 'ctrlKey');

        let eventEmitter = useEmitter(); // Emits/receives events from other components

        let windowEvents = useWindowEvents(); // Handles window-level keypresses, etc.

        let tweenGroup = useTweenGroup(); // Manages the joint pan/zoom tween when a user jumps to a block.

        let pannable = usePannable();         // Moving the canvas
        let mouseSampler = useMouseSampler(); // Downsamples the mouse move events for a more consistent framerate
        let panDragging = false;              // This works in tandem with "pannable". Used when user doesn't have trackpad, so they pan via right-click-and-drag.

        let linkStart = reactive({ x: 0, y: 0, isSelected: false });
        let linkDestination = computed(() => {
            if (!blockTrayLinking.isDragging) return { x: 0, y: 0 };
            return {
                x: (blockTrayLinking.currentCoords.x - pannable.deltaDrag.value.x) / zoomable.scale.value,
                y: (blockTrayLinking.currentCoords.y - pannable.deltaDrag.value.y) / zoomable.scale.value, isSelected: false
            };
        });

        let blockDragDestination = reactive<{deltaX: number, deltaY: number}>({deltaX: 0, deltaY: 0});

        let blockUnderMouse: Ref<string | undefined> = ref(undefined);
        let ghostBlock = reactive({
            block: new Block('ghostBlock', { x: 0, y: 0, width: DEFAULT_BLOCK_WIDTH, height: DEFAULT_BLOCK_HEIGHT }),
            scale: 1
        });

        type SnapZone = {x: number, y: number, scale: number, key: number};
        let snapZones: Ref<SnapZone[]> = ref([]);
        function beginBlockTrayLinking(mouseEvent: MouseEvent, metadata: any) {
            blockTrayLinking.mouseDown(mouseEvent, metadata);

            linkStart.x = blockTrayLinking.metadata.data.sourceBoundingBox.x + blockTrayLinking.metadata.data.sourceBoundingBox.width/2;
            linkStart.y = blockTrayLinking.metadata.data.sourceBoundingBox.y + blockTrayLinking.metadata.data.sourceBoundingBox.height/2;

            // Update ghost block position/size
            let parentBlockId    = blockTrayLinking.metadata.data.sourceBlockId;
            let parentBlockScale = blockScales.value[parentBlockId];
            ghostBlock.scale                 = (parentBlockScale + parentBlockScale*0.5);
            ghostBlock.block.location.width  = DEFAULT_BLOCK_WIDTH / (parentBlockScale + parentBlockScale*0.5);
            ghostBlock.block.location.height = DEFAULT_BLOCK_HEIGHT / (parentBlockScale + parentBlockScale*0.5);
            ghostBlock.block.location.x      = linkDestination.value.x - ghostBlock.block.location.width/2;
            ghostBlock.block.location.y      = linkDestination.value.y - ghostBlock.block.location.height/2;

            // Build up a list of "snap zones"
            snapZones.value = createSnapZonesFromBlocks(store.state.hierarchyData.hierarchy[parentBlockId].childrenBlockIds, ghostBlock.block.location, ghostBlock.scale);
        }
        function createSnapZonesFromBlocks(blockIds: string[], snapBlockLocation: BoundingBox, scale: number) {
            const gap = 10 / scale;
            let count = 0;
            return blockIds
                .map(blockId => blocks.value[blockId].location)
                .reduce((acc, bounds) => {
                    acc.push(
                        { // Above
                            x: bounds.x + bounds.width/2,
                            y: bounds.y - snapBlockLocation.height/2 - gap,
                            scale: scale, key: count++
                        }, { // Below
                            x: bounds.x + bounds.width/2,
                            y: bounds.y + bounds.height + snapBlockLocation.height/2 + gap,
                            scale: scale, key: count++
                        }, { // Left
                            x: bounds.x - snapBlockLocation.width/2 - gap,
                            y: bounds.y + bounds.height/2,
                            scale: scale, key: count++
                        }, { // Right
                            x: bounds.x + bounds.width + snapBlockLocation.width/2 + gap,
                            y: bounds.y + bounds.height/2,
                            scale: scale, key: count++
                        },
                    );
                    return acc;
                }, [] as SnapZone[]);
        }
        function getBestSnapZone(x: number, y: number, widthBounds: number, heightBounds: number) {
            if (snapZones.value.length === 0)
                return { x, y };

            // Determine the closest snap zone
            let closest = snapZones.value.map(point => ({
                x: point.x,
                y: point.y,
                d: Math.sqrt(
                    Math.pow(point.x - x, 2) +
                    Math.pow(point.y - y, 2)),
            })).sort((a, b) => a.d - b.d)[0];

            // If the closest snap zone is close enough, then return it. Otherwise, return our initial location.
            return ( Math.abs(closest.x - x) < widthBounds/2 &&
                     Math.abs(closest.y - y) < heightBounds/2 )
                ? { x: closest.x, y: closest.y }
                : { x, y };
        }

        // This is our (downsampled) mouseMove handler
        mouseSampler.setCallback((lastEvent, movementX, movementY) => {
            selectionDraggable.mouseMove(lastEvent);
            blockTrayLinking.mouseMove(lastEvent);
            blockDraggable.mouseMove(lastEvent);
            blockResizable.mouseMove(lastEvent);

            // Snap when creating children
            if (blockTrayLinking.isDragging.value && blockTrayLinking.metadata.data.type === 'setCreateChild') {
                let target = {
                    x: linkDestination.value.x,
                    y: linkDestination.value.y,
                }

                let parentBlockId    = blockTrayLinking.metadata.data.sourceBlockId;
                let parentBlockScale = blockScales.value[parentBlockId];
                const widthBounds  = DEFAULT_BLOCK_WIDTH / (parentBlockScale + parentBlockScale*0.5);
                const heightBounds = DEFAULT_BLOCK_HEIGHT / (parentBlockScale + parentBlockScale*0.5);
                target = getBestSnapZone(target.x, target.y, widthBounds, heightBounds);

                ghostBlock.block.location.x = target.x - ghostBlock.block.location.width/2;
                ghostBlock.block.location.y = target.y - ghostBlock.block.location.height/2;
            }

            // Snap when moving blocks
            if (blockDraggable.isDragging.value) {
                const draggedBlock: Block = blocks.value[blockDraggable.metadata.data.blockId];
                let target = {
                    x: (draggedBlock.location.x + draggedBlock.location.width/2 + blockDraggable.deltaDrag.value.deltaX / zoomable.scale.value),
                    y: (draggedBlock.location.y + draggedBlock.location.height/2 + blockDraggable.deltaDrag.value.deltaY / zoomable.scale.value),
                }
                target = getBestSnapZone(target.x, target.y, draggedBlock.location.width, draggedBlock.location.height);
                blockDragDestination.deltaX = (target.x - (draggedBlock.location.x + draggedBlock.location.width/2)) * zoomable.scale.value;
                blockDragDestination.deltaY = (target.y - (draggedBlock.location.y + draggedBlock.location.height/2)) * zoomable.scale.value;
            }

            if (panDragging && (movementX !== 0 || movementY !== 0)) {
                tweenGroup.stopGroup();
                pannable.panBy(-movementX, -movementY);
            }
        });

        let zoomable = useZoomable(pannable); // Zooming the canvas

        let yOffset = 0; // Gets set to final/correct value when this gets onMounted()

        let blockScales = computed(() => store.getters.blockScales);

        provide('canvasPan', pannable.deltaDrag);
        provide('canvasZoom', zoomable.scale);

        let xyToPersistedCoordinates = function(clientX: number, clientY: number) {
            return {
                x: (clientX - pannable.deltaDrag.value.x) / zoomable.scale.value,
                y: (clientY - pannable.deltaDrag.value.y - yOffset) / zoomable.scale.value,
            }
        }
        let distanceToPersistedCoordinates = function(screenDeltaX: number, screenDeltaY: number) {
            return {
                dx: screenDeltaX / zoomable.scale.value,
                dy: screenDeltaY / zoomable.scale.value,
            }
        }

        let ctrlHeld = ref(false);
        let inBulkCreationMode = ref(false);
        let blocksBulkCreated: Ref<string[]> = ref([]);

        // The application's titlebar shifts the canvas down by ~60 pixels. This accounts for that
        // in our draggable/zoomable functionality.
        const blockCanvas = ref(null);
        onMounted(() => {
            let canvasBoundingBox = (blockCanvas.value as any).getBoundingClientRect();

            yOffset = canvasBoundingBox.top;
            provide('canvasYOffset', yOffset);
            zoomable.setOffset(0, yOffset);
            selectionDraggable.setOffset(0, yOffset);
            blockTrayLinking.setOffset(0, yOffset);
            blockDraggable.setOffset(0, yOffset);
            blockResizable.setOffset(0, yOffset);

            // Centers "0, 0" on the user's screen
            pannable.panBy(-canvasBoundingBox.width/2, -canvasBoundingBox.height/2);

            // Delete blocks when the user presses delete or backspace
            windowEvents.register('blockDeletion', 'keydown', (keyboardEvent: KeyboardEvent) => {
                if (!store.state.viewData.activeViewConfig) {
                    let selectedBlockIds = store.getters.selectedBlockIds;
                    if (selectedBlockIds.length > 0 && (keyboardEvent.code === "Delete" || keyboardEvent.code === "Backspace")) {
                        // Certain browsers (firefox) use the "backspace" key to go back a page. We don't want that behavior.
                        keyboardEvent.preventDefault();

                        // Send the update request to the server
                        new DeleteBlocksAction(selectedBlockIds).submit();

                        return; // Processed a keystroke, so exit.
                    }
                }
            });
            windowEvents.register('modifierPressed', 'keydown', (keyboardEvent: KeyboardEvent) => {
                if (keyboardEvent.key === 'Control' || keyboardEvent.key === 'Meta') // "meta" is "cmd" for Macs
                    ctrlHeld.value = true;
            });
            windowEvents.register('modifierReleased', 'keyup', (keyboardEvent: KeyboardEvent) => {
                if (keyboardEvent.key === 'Control' || keyboardEvent.key === 'Meta') // "meta" is "cmd" for Macs
                    ctrlHeld.value = false;
            });

            // Set up event handlers, allowing other components to "steer" the canvas view
            eventEmitter.register('canvasGoToBlock', 'goToBlock', (blockId) => {
                let block = blocks.value[blockId as string];
                if (block) {
                    let canvasBoundingBox = (blockCanvas.value as unknown as HTMLCanvasElement).getBoundingClientRect();
                    let targetZoomFactor = blockScales.value[block.id];
                    let target = {
                        x: canvasBoundingBox.width/2 - targetZoomFactor*block.location.x - targetZoomFactor*block.location.width/2,
                        y: canvasBoundingBox.height/2 - targetZoomFactor*block.location.y - targetZoomFactor*block.location.height/2,
                    }
                    zoomable.zoomTo(targetZoomFactor, 700, tweenGroup.sharedTweenGroup);
                    pannable.panTo(target.x, target.y, 700, tweenGroup.sharedTweenGroup);
                    requestAnimationFrame(tweenGroup.updateGroup);
                }
            });

            // Related to bulk-creating blocks:
            eventEmitter.register('canvasBlockCreated', 'blockCreated', (blockId) => {
                if (inBulkCreationMode.value) {
                    blocksBulkCreated.value.unshift(blockId);
                }
            });
            function exitBulkCreateMode() {
                let lastCreatedId = blocksBulkCreated.value[0];
                if (lastCreatedId) {
                    let block = blocks.value[lastCreatedId];
                    if (block.content.data.text.trim().length === 0) {
                        // Delete the final (empty) block
                        blocksBulkCreated.value.shift();
                        new DeleteBlocksAction([lastCreatedId]).submit();
                    }
                }
                inBulkCreationMode.value = false;
                ctrlHeld.value = false;

                // The timeout prevents the blocks from being immediately de-selected if the user exits bulk create mode by clicking the background.
                setTimeout(() => store.dispatch("selectBlocks", {
                    blockIds: blocksBulkCreated.value,
                    clearCurrentSelection: true
                }), 100);
            }
            eventEmitter.register('canvasBlockEditComplete', 'blockEditComplete', ({newContents, cancelled}: {newContents: BlockContent, cancelled: boolean}) => {
                if (inBulkCreationMode.value) {
                    if (cancelled) {
                        exitBulkCreateMode();
                    } else {
                        let lastCreatedId = blocksBulkCreated.value[0];
                        if (lastCreatedId) {
                            let block = blocks.value[lastCreatedId];
                            if (newContents.data.text.trim().length === 0) {
                                exitBulkCreateMode();
                            } else {
                                const heightDifference = block.location.height + (10/blockScales.value[block.id]);
                                new CreateBlockAction({
                                        x: block.location.x,
                                        y: block.location.y + heightDifference,
                                        width: block.location.width,
                                        height: block.location.height,
                                    },
                                    store.state.hierarchyData.hierarchy[block.id]?.parentBlockId,
                                ).submit();
                            }
                        }
                    }
                }
            });

        });

        onUnmounted(() => {
            windowEvents.deregisterAll();
            eventEmitter.deregister('canvasGoToBlock');
        });

        // We have a 0x0 invisible box on the canvas because chrome. Whenever the user pans or zooms, we toggle the opacity
        // of this invisible rectangle between 0 and 1. This forces Chrome to re-render the foreignObject elements that were
        // off-screen but have since panned back on-screen. Otherwise, they don't render until the user does something like
        // move their mouse over them. Chrome is great.
        // Thanks Ian <3 https://stackoverflow.com/questions/60904145/in-chrome-svg-elements-constructed-too-far-off-screen-do-not-render-when-brough
        let spazboxOpacity = ref(0);
        let spazTimeout: any = undefined;
        watch([zoomable.scale, pannable.deltaDrag.value], () => {
            if (spazTimeout) { window.clearTimeout(spazTimeout); }
            spazTimeout = setTimeout(() => {
                spazboxOpacity.value = (spazboxOpacity.value === 0) ? 1 : 0;
            }, 100);
        });

        return {
            spazboxOpacity,
            ghostBlock,
            snapZones,
            blockUnderMouse,

            DEFAULT_BLOCK_WIDTH,
            DEFAULT_BLOCK_HEIGHT,

            // Variables (and refs)
            blockCanvas, blockScales, ctrlHeld,

            // zoomable.scale is only used when the user is dragging or resizing blocks. By forcing it to be "1" when the user isn't doing
            // one of these things, it gives us a HUGE performance optimization when the user is zooming in/out.
            zoomScale: computed(() => {
                if (blockDraggable.isDragging.value || blockResizable.isDragging.value) {
                    return zoomable.scale.value;
                } else {
                    return 1;
                }
            }),

            // Computed
            blocks, links,
            nonExpandedBlockIds: computed(() => {
                return Object.keys(blocks.value).filter(eId => !expandedBlockIds.value.includes(eId))
            }),
            expandedBlockIds: computed(() => {
                return Object.keys(blocks.value).filter(eId => expandedBlockIds.value.includes(eId))
            }),
            linkStart, linkDestination,
            blockDragDestination,

            // Methods
            beginBlockTrayLinking,
            createNewBlock: (mouseEvent: MouseEvent) => {
                let dropLocation = xyToPersistedCoordinates(mouseEvent.clientX, mouseEvent.clientY);

                new CreateBlockAction({
                        x: dropLocation.x - (DEFAULT_BLOCK_WIDTH / 2),
                        y: dropLocation.y - (DEFAULT_BLOCK_HEIGHT / 2),
                        width: DEFAULT_BLOCK_WIDTH,
                        height: DEFAULT_BLOCK_HEIGHT,
                    },
                ).submit();
            },
            startBlockDrag: (mouseEvent: MouseEvent, metadata: { blockId: string }) => {
                blockDraggable.mouseDown(mouseEvent, metadata);
                blockDragDestination.deltaX = blockDraggable.deltaDrag.value.deltaX;
                blockDragDestination.deltaY = blockDraggable.deltaDrag.value.deltaY;

                const currentBlock: Block = blocks.value[metadata.blockId];
                let snapZoneBlocks = store.getters.getSiblings(metadata.blockId);
                // Non-selected blocks only ... unless we're moving a block that wasn't selected, in which case our entire selection will be cleared by this action so it won't matter.
                if (currentBlock.isSelected) {
                    let selectedBlockIds = store.getters.selectedBlockIds;
                    ArrayUtils.removeEntries(snapZoneBlocks, selectedBlockIds);
                }
                // Never include the block being dragged for snap points
                let draggedIndex = snapZoneBlocks.indexOf(metadata.blockId);
                if (draggedIndex !== -1) snapZoneBlocks.splice(draggedIndex, 1);
                snapZones.value = createSnapZonesFromBlocks(snapZoneBlocks, currentBlock.location, blockScales.value[metadata.blockId]);
            },
            mouseDown: (mouseEvent: MouseEvent) => {
                if (mouseEvent.button === 0) { // Left mouse button
                    store.dispatch('setDisablePointerEvents', true);
                    selectionDraggable.mouseDown(mouseEvent);
                } else if (mouseEvent.button === 2) { // Right mouse button
                    store.dispatch('setDisablePointerEvents', true);
                    panDragging = true;
                }
            },
            mouseMove: (mouseEvent: MouseEvent) => {
                mouseSampler.recordEvent(mouseEvent);
            },
            completeDraggableActions: (mouseEvent: MouseEvent) => {
                store.dispatch('setDisablePointerEvents', false);
                snapZones.value = [];

                // -- Select blocks by bounding box --
                if (selectionDraggable.isDragging.value) {
                    const shouldKeepSelection = addSelectKey.value === 'ctrlKey'
                        ? mouseEvent.ctrlKey || mouseEvent.metaKey // "metaKey" is "cmd" for Mac
                        : mouseEvent.shiftKey;
                    store.dispatch('selectBlocksByBoundingBox', {
                        boundingBox: {
                            x: (selectionDraggable.boundingBox.value.x - pannable.deltaDrag.value.x) / zoomable.scale.value,
                            y: (selectionDraggable.boundingBox.value.y - pannable.deltaDrag.value.y) / zoomable.scale.value,
                            width: selectionDraggable.boundingBox.value.width / zoomable.scale.value,
                            height: selectionDraggable.boundingBox.value.height / zoomable.scale.value
                        },
                        clearCurrentSelection: !shouldKeepSelection,
                    });

                    selectionDraggable.mouseUp();
                }

                // -- Pan by right-click-and-drag --
                if (panDragging) {
                    // The panning happened throughout the drag. No additional actions to perform.
                    panDragging = false;
                }

                // -- Move blocks --
                if (blockDraggable.isDragging.value) {
                    if (blockDragDestination.deltaX !== 0 || blockDragDestination.deltaY !== 0) {
                        // Update our local store. (This assumes the server accepts the request)
                        let translatedWH = distanceToPersistedCoordinates(blockDragDestination.deltaX, blockDragDestination.deltaY)

                        // Send the update request to the server
                        let request = new SetBlockPositionsAction();
                        for (let id of store.getters.selectedBlockIds) {
                            let block = store.state.blockData.blocks[id];
                            request.addBlockAndPosition(id, {
                                x: block.location.x + translatedWH.dx,
                                y: block.location.y + translatedWH.dy,
                                width: block.location.width,
                                height: block.location.height,
                            });
                        }
                        request.submit();
                    }

                    blockDraggable.mouseUp();
                    blockDragDestination.deltaX = 0;
                    blockDragDestination.deltaY = 0;
                }

                // -- Resize blocks --
                if (blockResizable.isDragging.value) {
                    // Update our local store. (This assumes the server accepts the request)
                    let translatedWH = distanceToPersistedCoordinates(blockResizable.deltaDrag.value.deltaWidth, blockResizable.deltaDrag.value.deltaHeight);
                    let translatedDeltaXY = distanceToPersistedCoordinates(blockResizable.deltaDrag.value.deltaX, blockResizable.deltaDrag.value.deltaY);

                    // Send the update request to the server
                    let request = new SetBlockPositionsAction();
                    for (let id of store.getters.selectedBlockIds) {
                        let block = store.state.blockData.blocks[id];
                        let normalized = RectangleUtils.normalize(
                            block.location.x + translatedDeltaXY.dx,  block.location.y + translatedDeltaXY.dy,
                            block.location.width + translatedWH.dx,   block.location.height + translatedWH.dy);
                        normalized.width  = Math.max(normalized.width,  MIN_BLOCK_WIDTH / blockScales.value[id]);
                        normalized.height = Math.max(normalized.height, MIN_BLOCK_HEIGHT / blockScales.value[id]);
                        request.addBlockAndPosition(id, normalized);
                    }
                    request.submit();

                    blockResizable.mouseUp();
                }

                // -- Link blocks --
                if (blockTrayLinking.isDragging.value) {
                    let dropLocation = xyToPersistedCoordinates(mouseEvent.clientX, mouseEvent.clientY);
                    let targetBlock = store.getters.blockAtCoordinates(dropLocation);

                    let sourceBlockId = blockTrayLinking.metadata.data.sourceBlockId;
                    let targetBlockId = targetBlock ? targetBlock.id : undefined;

                    if (targetBlockId === sourceBlockId) {
                        // (If user dropped onto itself, then do nothing.)
                    } else if (blockTrayLinking.metadata.data.type === 'setCreateChild') {
                        if (targetBlockId) {
                            // Send the update request to the server
                            new SetBlockParentAction({
                                blockId:       targetBlockId,
                                parentBlockId: sourceBlockId,
                            }).submit();
                        } else {
                            if (mouseEvent.ctrlKey || mouseEvent.metaKey) { // "meta" is "cmd" for Macs
                                blocksBulkCreated.value = [];
                                inBulkCreationMode.value = true;
                            }
                            new CreateBlockAction({...ghostBlock.block.location}, sourceBlockId).submit();
                        }
                    }

                    blockTrayLinking.mouseUp();
                }
            },
            mouseEnterBlock: (blockId: string) => { blockUnderMouse.value = blockId;   },
            mouseLeaveBlock: (blockId: string) => { blockUnderMouse.value = undefined; },

            // Compositions
            // Need to all be reactive because of this: https://github.com/vuejs/vue-next/pull/1682
            pannable: reactive(pannable),
            zoomable: reactive(zoomable),
            selectionDraggable: reactive(selectionDraggable),
            blockDraggable: reactive(blockDraggable),
            blockTrayLinking: reactive(blockTrayLinking),
            blockResizable: reactive(blockResizable),
            tweenGroup: reactive(tweenGroup),

        }
    },
})
</script>

<style lang="scss">
@use '../../styles/variables' as vars;

.mw-app-relationship-canvas {
    width: 100%;
    height: 100%;

    // Make all the text non-selectable (helpful because of all the dragging)
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;

    &.creating-bulk { cursor: copy; }

    .selection-box {
        stroke: vars.$gray-very-light;
        fill: rgba(255, 255, 255, 0.1);
        stroke-width: 2px;
    }

    .canvas-welcome-text {
        text-anchor: middle;
        font-size: 1.7em;
        fill: vars.$gray3;
    }

    .mwe-snap-zone {
        fill: vars.$gray1;
    }
}

</style>
