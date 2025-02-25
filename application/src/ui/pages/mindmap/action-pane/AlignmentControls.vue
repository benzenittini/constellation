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
                title="Line up all selected blocks horizontally, L-to-R. Hold ctrl/cmd for R-to-L.">
                <eic-svg-stack-blocks width="11" height="33"></eic-svg-stack-blocks>
            </div>

            <!-- "Align in Column" (10w x 30h) -->
            <div id="ac-align-in-column" class="mw-icon" data-test="ac-align-in-column" v-on:click="alignInColumn"
                title="Stack all selected blocks vertically, T-to-B. Hold ctrl/cmd for B-to-T.">
                <eic-svg-stack-blocks width="11" height="33"></eic-svg-stack-blocks>
            </div>
        </div>

    </div>
</template>

<script lang="ts">

import { computed, defineComponent } from "vue";

import { ArrayUtils } from 'constellation-common/utilities';
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
            alignInRow: (mouseEvent: MouseEvent) => {
                // Scale the "gap" between the blocks based on their own scale (depth). Since they can technically be at different depths, use the "mode".
                // Ties go to the biggest number, which creates the smallest gap.
                let scale = Math.max(...ArrayUtils.mode(selectedBlocks.value.map(e => blockScales.value[e.id])));
                let blockGap = 10/scale;

                const reversed = mouseEvent.ctrlKey || mouseEvent.metaKey;

                // Center-align the stack starting from the left-most block (or right-most if reversed)
                let startingBlock = selectedBlocks.value
                    .reduce((prev, curr) => {
                        const prevLocX = reversed ? prev.location.x + prev.location.width : prev.location.x;
                        const currLocX = reversed ? curr.location.x + curr.location.width : curr.location.x;
                        if (prevLocX < currLocX) {
                            return reversed ? curr : prev;
                        } else if (prevLocX > currLocX) {
                            return reversed ? prev : curr;
                        } else {
                            return prev.location.y < curr.location.y
                                ? reversed ? curr : prev
                                : reversed ? prev : curr;
                        }
                    });
                let currentX = startingBlock.location.x; // Every block will have a different X.
                let centerY = startingBlock.location.y + startingBlock.location.height/2; // All blocks will have the same Y *centerpoint*.

                // We want to sort the blocks by their "x" location so the user has some control over the ordering that they're stacked.
                let sortedBlocks = selectedBlocks.value
                    .map(e => ({ id: e.id, location: e.location }))
                    .sort((a, b) => reversed
                        ? (a.location.x + a.location.width) - (b.location.x + b.location.width)
                        : a.location.x - b.location.x);
                if (reversed) sortedBlocks.reverse();

                // Submit the action
                let request = new SetBlockPositionsAction();
                let isFirst = true;
                for (let block of sortedBlocks) {
                    if (reversed && !isFirst) {
                        currentX -= block.location.width + blockGap;
                    }
                    request.addBlockAndPosition(block.id, {
                        x: currentX,
                        y: centerY - block.location.height/2,
                        width: block.location.width,
                        height: block.location.height,
                    });
                    if (!reversed) {
                        currentX += block.location.width + blockGap;
                    }
                    isFirst = false;
                }
                request.submit();
            },
            alignInColumn: (mouseEvent: MouseEvent) => {
                // Scale the "gap" between the blocks based on their own scale (depth). Since they can technically be at different depths, use the "mode".
                // Ties go to the biggest number, which creates the smallest gap.
                let scale = Math.max(...ArrayUtils.mode(selectedBlocks.value.map(e => blockScales.value[e.id])));
                let blockGap = 10/scale;

                const reversed = mouseEvent.ctrlKey || mouseEvent.metaKey;

                // Center-align the stack starting from the top-most block (or bottom-most if reversed)
                let startingBlock = selectedBlocks.value
                    .reduce((prev, curr) => {
                        const prevLocY = reversed ? prev.location.y + prev.location.height : prev.location.y;
                        const currLocY = reversed ? curr.location.y + curr.location.height : curr.location.y;
                        if (prevLocY < currLocY) {
                            return reversed ? curr : prev;
                        } else if (prevLocY > currLocY) {
                            return reversed ? prev : curr;
                        } else {
                            return prev.location.x < curr.location.x
                                ? reversed ? curr : prev
                                : reversed ? prev : curr;
                        }
                    });
                let centerX = startingBlock.location.x + startingBlock.location.width/2; // All blocks will have the same X *centerpoint*.
                let currentY = startingBlock.location.y; // Every block will have a different Y.

                // We want to sort the blocks by their "y" location so the user has some control over the ordering that they're stacked.
                let sortedBlocks = selectedBlocks.value
                    .map(e => ({ id: e.id, location: e.location }))
                    .sort((a, b) => reversed
                        ? (a.location.y + a.location.height) - (b.location.y + b.location.height)
                        : a.location.y - b.location.y);
                if (reversed) sortedBlocks.reverse();

                // Submit the action
                let request = new SetBlockPositionsAction();
                let isFirst = true;
                for (let block of sortedBlocks) {
                    if (reversed && !isFirst) {
                        currentY -= block.location.height + blockGap;
                    }
                    request.addBlockAndPosition(block.id, {
                        x: centerX - block.location.width/2,
                        y: currentY,
                        width: block.location.width,
                        height: block.location.height,
                    });
                    if (!reversed) {
                        currentY += block.location.height + blockGap;
                    }
                    isFirst = false;
                }
                request.submit();
            }
        }
    },
})
</script>

<style>

.mw-app-relationship-alignmentcontrols {
    text-align: center;
    margin: 30px 0;

    .mw-icon {
        &:hover {
            .arrow,.block { stroke: var(--gray-very-light); }
            .block { fill: var(--gray-very-light); }
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

    /* Need to reverse/flip these two icons. */
    #ac-equalize-heights>svg { transform: scaleX(-1) rotate(90deg); }
    #ac-align-in-row>svg     { transform: scaleX(-1) rotate(90deg); }

}
</style>