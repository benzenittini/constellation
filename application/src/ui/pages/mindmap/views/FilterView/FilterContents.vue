<template>
    <div class="mw-app-filter-contents">
        <div class="mwe-filter-blocks" v-on:click="mouseClick($event)">
            <div class="mwe-selection-links">Select:
                <span v-on:click.stop="selectAll()">all</span>
                |
                <span v-on:click.stop="selectNone()">none</span>
            </div>
            <div v-if="selectedButFilteredBlocks.length > 0" class="mwe-selected-but-filtered">
                <p>These blocks are selected, but no longer pass the view's filter. They'll disappear when deselected.</p>
                <div class="mwe-filtered-block-section">
                    <div v-for="block in selectedButFilteredBlocks" v-bind:key="block.id"
                        class="mwe-block mwm-unselectable"
                        v-bind:class="{ 'mwm-selected': selectedBlockIds.includes(block.id) }"
                        v-bind:style="getBlockStyle(block)"
                        v-on:click.stop="toggleSelection($event, block)"
                        v-on:dblclick.stop="goToBlock(block.id)">
                        <div v-if="getBreadcrumbs(block.id).length > 0" class="mwe-breadcrumbs">{{ getBreadcrumbs(block.id) }}</div>
                        <div class="mwe-block-content">{{ block.content.data.text }}</div>
                    </div>
                </div>
            </div>
            <div class="mwe-filter-block-section">
                <div v-if="blocks.length === 0" class="mwe-filter-no-blocks">
                    There are no blocks that pass this view's filter.
                </div>
                <div v-for="block in blocks" v-bind:key="block.id"
                    class="mwe-block mwm-unselectable"
                    v-bind:class="{ 'mwm-selected': selectedBlockIds.includes(block.id) }"
                    v-bind:style="getBlockStyle(block)"
                    v-on:click.stop="toggleSelection($event, block)"
                    v-on:dblclick.stop="goToBlock(block.id)">
                    <div v-if="getBreadcrumbs(block.id).length > 0" class="mwe-breadcrumbs">{{ getBreadcrumbs(block.id) }}</div>
                    <div class="mwe-block-content">{{ block.content.data.text }}</div>
                </div>
            </div>
        </div>
        <div class="mwe-filter-actions">
            <eic-action-pane
                v-bind:mw-selected-blocks="selectedBlocks"
                v-bind:mw-selected-block-ids="selectedBlockIds"
                v-bind:mw-show-alignment-controls="false"
                v-bind:mw-show-after-number-selected="0"
                ></eic-action-pane>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, Ref } from "vue";

import { useStore } from "../../../../store/store";
import { FilterViewConfig } from "../../../../../../../common/DataTypes/ViewDataTypes";
import { useView } from "../../../../composables/View";

export default defineComponent({
    props: {
        mwViewConfig: Object,
    },
    setup(props, context) {
        const store = useStore();

        let filterConfig = computed(() => store.state.viewData.activeViewConfig as FilterViewConfig);

        let blocks = computed(() => store.getters.displayedBlocks);
        let view = useView(blocks, context);

        return {
            blocks,
            ...view,
            mouseClick: (event: MouseEvent) => {
                // If the user is holding down shift, we don't want to clear their selection because
                // they're probably trying to add new blocks to the list and just mis-clicked.
                if (!event.shiftKey) {
                    view.selectNone();
                }
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

.mw-app-filter-contents {

    background: vars.$gray1;
    display: flex;

    $block-width: 250px;

    .mwe-filter-blocks {
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: $block-width;

        display: flex;
        flex-direction: column;

        // 300px for the config pane width. Otherwise, the config pane gets pushed off the screen.
        width: calc(100% - 300px);
    }

    .mwe-selection-links {
        padding: 10px;
        color: vars.$gray-medium;
        background: vars.$gray-very-dark;
        display: inline-block;
        margin: 16px;
        border-radius: vars.$radius-small;
        box-shadow: vars.$shadow-down-right-medium;
        align-self: flex-start;
        span {
            cursor: pointer;
            &:hover { color: vars.$gray-very-light; }
        }
    }

    .mwe-filter-block-section {
        .mwe-filter-no-blocks { padding: 8px; color: vars.$gray-light; }
        .mwe-block { width: $block-width; margin: 5px; }

        margin: 16px;
        background: vars.$gray2;
        border-radius: vars.$radius-medium;
        box-shadow: vars.$shadow-inset-down-medium;
        border: 1px solid vars.$gray-very-dark;

        padding: 10px;
        display: flex;
        gap: 10px;
        align-items: center;
        align-content: flex-start;
        flex-wrap: wrap;
        overflow-y: auto;
        @include mixins.scrollbars;
    }

    .mwe-filter-actions {
        flex-grow: 0;
        flex-shrink: 0;
        background: vars.$gray-very-dark;
    }

    .mw-app-actionpane {
        position: relative;
    }
}

</style>
