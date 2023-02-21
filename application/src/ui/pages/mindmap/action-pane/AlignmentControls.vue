<template>
    <div data-test="alignment-controls" class="mw-app-relationship-alignmentcontrols" v-on:dblclick.stop>

        <div class="icon-group">
            <!-- Equalize Widths -->
            <div id="ac-equalize-widths" class="mw-icon" data-test="ac-equalize-widths" v-on:click="equalizeWidths"
                title="Equalize the widths of all selected blocks.">
                <eic-svg-equalize-widths width="22" height="22"></eic-svg-equalize-widths>
            </div>

            <!-- Equalize Heights (use the "equalize-widths" svg, but rotate and flip it to make it work for "heights") -->
            <div id="ac-equalize-heights" class="mw-icon" data-test="ac-equalize-heights" v-on:click="equalizeHeights"
                title="Equalize the heights of all selected blocks.">
                <eic-svg-equalize-widths width="22" height="22"></eic-svg-equalize-widths>
            </div>
        </div>

        <div class="icon-group">
            <!-- "Align in Row" (30w x 10h) (use the vertical "stack-blocks" svg, but rotate and flip it to make it look horizontal) -->
            <div id="ac-align-in-row" class="mw-icon" data-test="ac-align-in-row" v-on:click="alignInRow"
                title="Line up all selected blocks horizontally.">
                <eic-svg-stack-blocks width="11" height="33"></eic-svg-stack-blocks>
            </div>

            <!-- "Align in Column" (10w x 30h) -->
            <div id="ac-align-in-column" class="mw-icon" data-test="ac-align-in-column" v-on:click="alignInColumn"
                title="Stack all selected blocks vertically.">
                <eic-svg-stack-blocks width="11" height="33"></eic-svg-stack-blocks>
            </div>
        </div>

    </div>
</template>

<script lang="ts">

import { computed, defineComponent } from "vue";

import { mode } from "../../../../common/ArrayUtils";
import { useStore } from "../../../store/store";

import { SetBlockPositionsAction } from '../../../actions/board-actions/SetBlockPositions';

export default defineComponent({
    props: {
    },
    setup(props, context) {
        const store = useStore();

        let selectedBlocks = computed(() => store.getters.selectedBlocks);
        let blockScales = computed(() => store.getters.blockScales);

        return {
            equalizeWidths: () => {
                let maxWidth = Math.max(...selectedBlocks.value.map(e => e.location.width));

                // Submit the action
                let request = new SetBlockPositionsAction();
                for (let block of selectedBlocks.value) {
                    request.addBlockAndPosition(block.id, {
                        x: block.location.x,
                        y: block.location.y,
                        width: maxWidth,
                        height: block.location.height,
                    });
                }
                request.submit();
            },
            equalizeHeights: () => {
                let maxHeight = Math.max(...selectedBlocks.value.map(e => e.location.height));

                // Submit the action
                let request = new SetBlockPositionsAction();
                for (let block of selectedBlocks.value) {
                    request.addBlockAndPosition(block.id, {
                        x: block.location.x,
                        y: block.location.y,
                        width: block.location.width,
                        height: maxHeight,
                    });
                }
                request.submit();
            },
            alignInRow: () => {
                // Scale the "gap" between the blocks based on their own scale (depth). Since they can technically be at different depths, use the "mode".
                let scale = mode(selectedBlocks.value.map(e => blockScales.value[e.id]));
                let blockGap = 10/scale;

                // Center-align the stack starting from the left-most block
                let leftMostBlock = selectedBlocks.value
                    .reduce((prev, curr) => {
                        if (prev.location.x < curr.location.x) {
                            return prev;
                        } else if (prev.location.x > curr.location.x) {
                            return curr;
                        } else {
                            return prev.location.y < curr.location.y ? prev : curr
                        }
                    });
                let currentX = leftMostBlock.location.x; // Every block will have a different X.
                let centerY = leftMostBlock.location.y + leftMostBlock.location.height/2; // All blocks will have the same Y *centerpoint*.

                // We want to sort the blocks by their "x" location so the user has some control over the ordering that they're stacked.
                let sortedBlocks = selectedBlocks.value
                    .map(e => ({ id: e.id, location: e.location }))
                    .sort((a, b) => a.location.x - b.location.x);

                // Submit the action
                let request = new SetBlockPositionsAction();
                for (let block of sortedBlocks) {
                    request.addBlockAndPosition(block.id, {
                        x: currentX,
                        y: centerY - block.location.height/2,
                        width: block.location.width,
                        height: block.location.height,
                    });
                    currentX += block.location.width + blockGap;
                }
                request.submit();
            },
            alignInColumn: () => {
                // Scale the "gap" between the blocks based on their own scale (depth). Since they can technically be at different depths, use the "mode".
                let scale = mode(selectedBlocks.value.map(e => blockScales.value[e.id]));
                let blockGap = 10/scale;

                // Center-align the stack starting from the top-most block
                let topMostBlock = selectedBlocks.value
                    .reduce((prev, curr) => {
                        if (prev.location.y < curr.location.y) {
                            return prev;
                        } else if (prev.location.y > curr.location.y) {
                            return curr;
                        } else {
                            return prev.location.x < curr.location.x ? prev : curr
                        }
                    });
                let centerX = topMostBlock.location.x + topMostBlock.location.width/2; // All blocks will have the same X *centerpoint*.
                let currentY = topMostBlock.location.y; // Every block will have a different Y.

                // We want to sort the blocks by their "y" location so the user has some control over the ordering that they're stacked.
                let sortedBlocks = selectedBlocks.value
                    .map(e => ({ id: e.id, location: e.location }))
                    .sort((a, b) => a.location.y - b.location.y);

                // Submit the action
                let request = new SetBlockPositionsAction();
                for (let block of sortedBlocks) {
                    request.addBlockAndPosition(block.id, {
                        x: centerX - block.location.width/2,
                        y: currentY,
                        width: block.location.width,
                        height: block.location.height,
                    });
                    currentY += block.location.height + blockGap;
                }
                request.submit();
            }
        }
    },
})
</script>

<style lang="scss">
@use '../../../styles/variables' as vars;

.mw-app-relationship-alignmentcontrols {
    text-align: center;
    margin: 30px 0;

    .mw-icon {
        &:hover {
            .arrow,.block { stroke: vars.$gray-very-light; }
            .block { fill: vars.$gray-very-light; }
        }
        cursor: pointer;
    }

    .icon-group {
        display: inline-block;
        padding: 0 15px;
    }
    .icon-group>div {
        display: inline-block;
        vertical-align: middle;
        text-align: center;
        width: 40px;
    }

    // Need to reverse/flip these two icons.
    #ac-equalize-heights>svg { transform: scaleX(-1) rotate(90deg); }
    #ac-align-in-row>svg     { transform: scaleX(-1) rotate(90deg); }

}
</style>