<template>
    <div class="mw-app-kanban-contents">
        <div class="mw-app-kanban-board" v-bind:style="{ 'margin-right': selectedBlocks.length >= 1 ? actionPaneWidth : 0 }">
            <div v-if="selectedButFilteredBlocks.length > 0"
                class="mwe-selected-but-filtered"
                v-on:click="mouseClick($event)">
                <p>These blocks are selected, but no longer pass the view's filter. They'll disappear when deselected.</p>
                <div class="mwe-filtered-block-section">
                    <div v-for="block in selectedButFilteredBlocks" v-bind:key="'kanban-' + block.id"
                        class="mwe-block"
                        v-bind:class="{ 'mwm-selected': selectedBlockIds.includes(block.id) }"
                        v-bind:style="getBlockStyle(block)"
                        v-on:click="toggleSelection($event, block)"
                        v-on:dblclick="goToBlock(block.id)">
                        <div v-if="getBreadcrumbs(block.id).length > 0" class="mwe-breadcrumbs">{{ getBreadcrumbs(block.id) }}</div>
                        <div class="mwe-block-content">{{ block.content.data.text }}</div>
                    </div>
                </div>
            </div>
            <div ref="columnsRef"
                class="mw-app-kanban-columns"
                v-on:mousedown.self="mouseDown($event)"
                v-on:click.self="mouseClick($event)"
                v-on:mousemove="mouseMove($event)"
                v-on:mouseup="mouseUp($event)">
                <div v-if="!columns || columns.length === 0" class="mwe-kanban-no-columns">
                    <h1>To create some columns, choose a field in the configuration below.</h1>
                    <h3>Columns are automatically created based on the "possible values" of the chosen field.</h3>
                </div>
                <div v-else v-for="grouping, i in groupedBlocks" v-bind:key="'kanban-' + grouping.pvId" class="mwe-kanban-column"
                    v-on:mousedown.self="mouseDown($event)"
                    v-on:click.self="mouseClick($event)">
                    <h2 class="mwe-kanban-column-header"
                        v-bind:class="{ 'mwe-uncategorized-column': grouping.isCurrentPV === false }"
                        v-on:mousedown.self="mouseDown($event)"
                        v-on:click.self="mouseClick($event)"
                    >{{ grouping.pvName }}</h2>
                    <div class="mwe-kanban-column-blocks"
                        :ref="el => { if (el) dragAreas[i] = el }"
                        v-bind:mw-pv-name="grouping.pvName"
                        v-on:mousedown.self="mouseDown($event)"
                        v-on:click.self="mouseClick($event)"
                        >
                        <div v-for="block in grouping.blocks" v-bind:key="'kanban-' + block.id"
                            class="mwe-block"
                            v-bind:class="{ 'mwm-selected': selectedBlockIds.includes(block.id) }"
                            v-bind:mw-block-id="block.id"
                            v-bind:style="getBlockStyle(block)"
                            v-on:click="toggleSelection($event, block)"
                            v-on:dblclick="goToBlock(block.id)">
                            <div v-if="getBreadcrumbs(block.id).length > 0" class="mwe-breadcrumbs">{{ getBreadcrumbs(block.id) }}</div>
                            <div class="mwe-block-content">{{ block.content.data.text }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <eic-action-pane
            v-if="columns && columns.length > 0"
            v-bind:mw-selected-blocks="selectedBlocks"
            v-bind:mw-selected-block-ids="selectedBlockIds"
            v-bind:mw-show-alignment-controls="false"
            v-bind:mw-show-after-number-selected="1"
            ></eic-action-pane>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUpdate, onMounted, onUpdated, Ref, ref, watch } from "vue";
import dragula from 'dragula';

import { useStore } from "../../../../store/store";
import { useView } from '../../../../composables/View';

import { TypedMap } from "../../../../../../../common/DataTypes/GenericDataTypes";
import { Block } from "../../../../../../../common/DataTypes/BlockDataTypes";
import { KanbanViewConfig } from "../../../../../../../common/DataTypes/ViewDataTypes";
import { SetFieldOnBlocksAction } from "../../../../actions/board-actions/SetFieldOnBlocks";
import { SetBlockPriorityAction } from "../../../../actions/board-actions/SetBlockPriority";

const CONFIG_PANE_WIDTH = 300; // px

export default defineComponent({
    props: {
        mwViewConfig: Object,
    },
    setup(props, context) {
        const store = useStore();

        let kanbanConfig = computed(() => store.state.viewData.activeViewConfig as KanbanViewConfig);

        let columns = computed(() => {
            if (kanbanConfig.value?.groupingFieldId) {
                return store.getters.getPossibleValueOptsForField(kanbanConfig.value.groupingFieldId);
            } else {
                return [];
            }
        });

        let displayedBlocks = computed(() => {
            // Only includes blocks that have the classification for the "grouping field" set.
            let groupingClassificationId = Object.values(store.getters.classifications)
                .find((c) => c.fieldIds.includes(kanbanConfig.value.groupingFieldId))
                ?.id;
            return store.getters.prioritizedBlocks.filter((block) => {
                return groupingClassificationId && block.classificationIds.includes(groupingClassificationId)
            });
        });

        let groupedBlocks = computed(() => {

            // pvName --> block[], and 'Uncategorized' is for all unset PVs
            let columnLookups = displayedBlocks.value.reduce((groupings, block) => {

                let pvName = block.fieldValues[kanbanConfig.value.groupingFieldId] || 'Uncategorized';
                if (!groupings[pvName]) {
                    groupings[pvName] = [];
                }
                groupings[pvName].push(block);
                return groupings;
            }, {} as TypedMap<Block[]>);

            let groupings = columns.value.map(c => ({
                pvId: c.value,
                pvName: c.display,
                isCurrentPV: true,
                blocks: columnLookups[c.display] || [],
            }));
            for (let pvName in columnLookups) {
                if (!groupings.some(g => g.pvName === pvName)) {
                    groupings.unshift({
                        pvId: pvName,
                        pvName: pvName,
                        isCurrentPV: false,
                        blocks: columnLookups[pvName],
                    });
                }
            }

            return groupings;
        });

        // (see: https://v3.vuejs.org/guide/composition-api-template-refs.html#usage-inside-v-for)
        let dragAreas: Ref<any[]> = ref([]);
        onBeforeUpdate(() => {
            dragAreas.value = [];
        });

        let drake: dragula.Drake | undefined = undefined;
        let overColumnRef: Ref<Element | null> = ref(null);
        let overColumnBB = computed(() => overColumnRef.value?.getBoundingClientRect());
        // Wrapped inside "onMounted" because we need to provide dragula with DOM refs
        onMounted(() => {
            // Classification drag-n-drop
            drake = dragula((dragAreas.value as any[]));
            drake.on('drop', (el, target, source, sibling) => {
                let fieldId = kanbanConfig.value.groupingFieldId;
                let blockId = el.getAttribute('mw-block-id')!;
                let beforeBlockId = sibling?.getAttribute('mw-block-id') || undefined;
                let newPVName = target.getAttribute('mw-pv-name')!;

                drake?.cancel(true);

                // We want to set the new priority to be before the "beforeBlockId", but
                // if this was dropped at the end of a column, there is no "beforeBlockId",
                // so we want to look up which block to put it *after* instead, and use
                // the block that follows that one as the "beforeBlockId".
                if (beforeBlockId === undefined) {
                    // Look up the block "higher" than the destination, and use the priority of that + 1
                    // If there isn't one "higher" than the destination, just keep "undefined".
                    let columnBlocks = groupedBlocks.value.find(g => g.pvName === newPVName)?.blocks;
                    if (columnBlocks && columnBlocks.length > 0) {
                        let afterBlockId = columnBlocks[columnBlocks.length-1].id;
                        let prioritizedBlocks = store.getters.prioritizedBlocks;
                        let afterBlockPriority = prioritizedBlocks.findIndex(e => e.id === afterBlockId);
                        if (afterBlockPriority !== -1 && afterBlockPriority < prioritizedBlocks.length - 1) {
                            beforeBlockId = prioritizedBlocks[afterBlockPriority+1].id;
                        }
                    }
                }
                // When the above logic executes, sometimes the block "after" the "before" block is
                // already the current block. When that happens, we're trying to put the block before
                // itself, which causes an error of sadness. Let's skip the priority if that happens.
                if (blockId !== beforeBlockId) {
                    new SetBlockPriorityAction(
                        [blockId],
                        beforeBlockId,
                    ).submit();
                }

                // Only update the field value if it changes
                let currentFieldValue = store.state.blockData.blocks[blockId]?.fieldValues[fieldId];
                if (currentFieldValue !== newPVName) {
                    new SetFieldOnBlocksAction(
                        fieldId,
                        { [blockId]: newPVName === 'Uncategorized' ? null : newPVName },
                    ).submit();
                }
            });
            drake.on('over', (el, container, source) => {
                overColumnRef.value = container;
            });
        });

        // If the user changes the columns in the kanban board, we need to add the new columns to dragula.
        // For simplicity, we just re-initialize all of fieldDrake's containers.
        watch(dragAreas, (newAreas) => {
            drake!.containers = newAreas;
        });

        // If the user selects an item on the kanban board, then "creates a new view", the item remained
        // selected, and left space on the right side of the screen for the config pane. That looked ugly.
        // So any time the view changes, we clear our selected items.
        watch(() => kanbanConfig.value?.id, () => {
            view.selectNone();
        });

        let view = useView(displayedBlocks, context);

        let isPanning = false;
        let columnsRef = ref(null as unknown as HTMLDivElement);
        let columnsBB = computed(() => columnsRef.value?.getBoundingClientRect());

        // Auto-scroll setup
        let scrollAmount = ref({ left: 0, top: 0 });
        let scrollTimer: number | null = null;
        const SCROLL_ZONE_SIZE = 100;
        function calculateScrollAmount(mouseEvent: MouseEvent) {
            let mouseX = mouseEvent.clientX;
            let mouseY = mouseEvent.clientY;
            let leftScroll = 0;
            let topScroll = 0;

            // Scroll kanban board left/right
            if (columnsBB.value) {
                let boardBB = columnsBB.value;
                let distanceFromLeft  = Math.abs(mouseX - boardBB.left);
                let distanceFromRight = Math.abs(mouseX - boardBB.right);

                if (distanceFromLeft < SCROLL_ZONE_SIZE) {
                    leftScroll = -(SCROLL_ZONE_SIZE - distanceFromLeft);
                } else if (distanceFromRight < SCROLL_ZONE_SIZE) {
                    leftScroll =  (SCROLL_ZONE_SIZE - distanceFromRight);
                }
            }

            // Scroll current column up/down
            if (overColumnBB.value) {
                let columnBB = overColumnBB.value;
                let distanceFromTop    = Math.abs(mouseY - columnBB.top);
                let distanceFromBottom = Math.abs(mouseY - columnBB.bottom);

                if (distanceFromTop < SCROLL_ZONE_SIZE) {
                    topScroll = -(SCROLL_ZONE_SIZE - distanceFromTop);
                } else if (distanceFromBottom < SCROLL_ZONE_SIZE) {
                    topScroll =  (SCROLL_ZONE_SIZE - distanceFromBottom);
                }
            }

            // "5" is just a magic number that seemed to scale the scroll speed ok.
            return { left: leftScroll/5, top: topScroll/5 };
        }

        return {
            ...view,

            columns,
            groupedBlocks,
            dragAreas,

            actionPaneWidth: CONFIG_PANE_WIDTH + 'px',

            columnsRef,

            mouseDown: (event: MouseEvent) => {
                if (columns.value.length > 0) {
                    isPanning = true;
                }
            },
            mouseClick: (event: MouseEvent) => {
                // If the user is holding down shift, we don't want to clear their selection because
                // they're probably trying to add new blocks to the list and just mis-clicked.
                if (!event.shiftKey) {
                    view.selectNone();
                }
            },
            mouseMove: (event: MouseEvent) => {
                // Check if the user is dragging a block
                if (drake?.dragging) {
                    scrollAmount.value = calculateScrollAmount(event);
                    if (scrollTimer === null) {
                        scrollTimer = window.setInterval(() => {
                            if ((drake?.dragging) && scrollAmount.value.left !== 0) {
                                columnsRef.value.scrollBy({ left: scrollAmount.value.left });
                            }
                            if ((drake?.dragging) && scrollAmount.value.top !== 0) {
                                overColumnRef.value?.scrollBy({ top: scrollAmount.value.top });
                            }
                        }, 20);
                    }
                } else if (scrollTimer !== null) {
                    clearInterval(scrollTimer);
                    scrollTimer = null;
                }

                // Check if the user is dragging the background
                if (isPanning) {
                    columnsRef.value.scrollBy({ left: -event.movementX });
                }
            },
            mouseUp: (event: MouseEvent) => {
                isPanning = false;
            },
        };
    }
})
</script>

<style lang="scss">

@use "sass:color";
@use "../../../../styles/variables" as vars;
@use "../../../../styles/mixins" as mixins;
@use "../../viewstyles";


.mw-app-kanban-contents {
    background: vars.$gray1;
    border-radius: vars.$radius-xlarge vars.$radius-xlarge 0 0;

    h2 { color: vars.$gray7; font-weight: bold; }

    .mw-app-kanban-board {
        @include mixins.unselectable;
        height: 100%;
        display: flex;
        flex-direction: column;
        transition: margin-right 0.1s
    }

    .mwe-kanban-no-columns {
        margin: 50px auto;
        text-align: center;
        padding: 50px 100px;
        color: vars.$gray5;
        background: vars.$gray2;
        border: 1px solid vars.$gray-very-dark;
        border-top: 2px solid vars.$pink-medium;
        border-radius: vars.$radius-medium;
        box-shadow: vars.$shadow-inset-down-medium;
        height: fit-content;
    }

    .mw-app-kanban-columns {
        flex-grow: 1; // vertical flex, to fill the screen.

        padding: 10px;
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        @include mixins.scrollbars;
    }

    .mwe-kanban-column {
        flex-basis: 300px;
        flex-shrink: 0;
        display: flex;
        height: 100%;
        flex-direction: column;
        margin: 16px;
        gap: 20px;

        .mwe-kanban-column-header,.mwe-kanban-column-blocks {
            background: vars.$gray2;
            border-radius: vars.$radius-medium;
            box-shadow: vars.$shadow-inset-down-medium;
            border: 1px solid vars.$gray-very-dark;
        }
        .mwe-kanban-column-header {
            margin: 0;
            padding: 18px 0;
            text-align: center;
            border-top: 2px solid vars.$pink-medium;
        }
        .mwe-kanban-column-blocks {
            flex-grow: 1;
            overflow-y: auto;
            @include mixins.scrollbars;
            border-radius: 10px 10px 0 0;
            padding: 10px;
        }

        .mwe-uncategorized-column {
            color: vars.$gray5;
        }
    }
}

</style>
