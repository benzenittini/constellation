<template>
    <g class="mw-app-relationship-link" data-test="link" v-bind:class="{selected: isSelected}">
        <!-- This thick, invisible line is to make it easier to trigger the "hover" -->
        <line class="invisible-line"
            v-bind:style="{ strokeWidth: 20/myDepthScale }"
            v-bind:x1="lineStart.x"
            v-bind:y1="lineStart.y"
            v-bind:x2="lineStop.x"
            v-bind:y2="lineStop.y" />

        <line class="connecting-line"
            v-bind:style="blockStyle"
            v-bind:x1="lineStart.x"
            v-bind:y1="lineStart.y"
            v-bind:x2="lineStop.x"
            v-bind:y2="lineStop.y" />

        <g class="delete-circle" data-test="link-delete-circle-source" v-on:click="deleteLink"
            v-if="source.blockId"
            v-bind:style="{ transform: `translate(${sourceBlockEdge.x}px, ${sourceBlockEdge.y}px) scale(${0.6/myDepthScale})` }">
            <circle r="15" cx="0" cy="0" />
            <line x1="-7" y1="-7" x2="7" y2="7"  />
            <line x1="-7" y1="7"  x2="7" y2="-7" />
        </g>

        <g class="delete-circle" data-test="link-delete-circle-destination" v-on:click="deleteLink"
            v-if="destination.blockId"
            v-bind:style="{ transform: `translate(${destinationBlockEdge.x}px, ${destinationBlockEdge.y}px) scale(${0.6/myDepthScale})` }">
            <circle r="15" cx="0" cy="0" />
            <line x1="-7" y1="-7" x2="7" y2="7"  />
            <line x1="-7" y1="7"  x2="7" y2="-7" />
        </g>
    </g>
</template>

<script lang="ts">

import { defineComponent, computed, reactive, watch } from "vue";

import { useStore } from "../../store/store";
import { SetBlockParentAction } from "../../actions/board-actions/SetBlockParent";

export default defineComponent({
    props: {
        eicSkipTween: Boolean,
        eicScale: Number, // The canvas's zoom scale factor
        myDepthScale: { // The block's depth scale factor
            type: Number,
            default: 1
        },
        source: Object,
        destination: Object,
        tempShift: Object,
        tempResize: Object,
    },
    setup(props) {
        const store = useStore();

        let blockStyle = computed(() => {
            let style: any = {};
            style.strokeWidth = 4 / props.myDepthScale;
            return style;
        });

        let lineStart = computed(() => {
            let targetCoords = { x: props.source!.x, y: props.source!.y };

            // Adjust for any active dragging/resizing if the source block is selected
            if (props.source!.isSelected) {
                let scale = (props.eicScale ? props.eicScale : 1);
                targetCoords.x += (props.tempShift!.deltaX + props.tempResize!.deltaX + props.tempResize!.deltaWidth/2) / scale;
                targetCoords.y += (props.tempShift!.deltaY + props.tempResize!.deltaY + props.tempResize!.deltaHeight/2) / scale;
            }
            return targetCoords;
        });

        let lineStop = computed(() => {
            let coords = { x: props.destination!.x, y: props.destination!.y };

            // Adjust for any active dragging/resizing if the source block is selected
            if (props.destination!.isSelected) {
                let scale = (props.eicScale ? props.eicScale : 1);
                coords.x += (props.tempShift!.deltaX + props.tempResize!.deltaX + props.tempResize!.deltaWidth/2) / scale;
                coords.y += (props.tempShift!.deltaY + props.tempResize!.deltaY + props.tempResize!.deltaHeight/2) / scale;
            }
            return coords;
        });

        function calculateEdgeIntersection(A: {x: number, y: number}, B: {x: number, y: number}, w: number, h: number): {x: number,  y: number} {
            // <3 https://stackoverflow.com/a/1585620
            // A = destination center
            // B = source center

            // Invert sign of y coordinates because SVG is backwards from math.
            let s = (-A.y+B.y)/(A.x-B.x);

            if (-h/2 <= s * w/2 && s * w/2 <= h/2) {
                if (A.x >= B.x) { // Right edge
                    return { x: B.x + (w/2), y: B.y - s*w/2 };
                } else { // Left edge
                    return { x: B.x - (w/2), y: B.y + s*w/2 };
                }
            } else {
                if (A.y >= B.y) { // Bottom edge
                    return { x: B.x - (h/2)/s, y: B.y + (h/2) };
                } else { // Top edge
                    return { x: B.x + (h/2)/s, y: B.y - (h/2) };
                }
            }
        }

        let sourceBlockEdge = computed(() => {
            let A = { x: props.destination?.x, y: props.destination?.y };
            let B = { x: props.source?.x, y: props.source?.y };
            let w = props.source?.blockWidth + 2*15*0.6/props.myDepthScale;
            let h = props.source?.blockHeight + 2*15*0.6/props.myDepthScale;
            return calculateEdgeIntersection(A, B, w, h);
        });

        let destinationBlockEdge = computed(() => {
            let A = { x: props.source?.x, y: props.source?.y };
            let B = { x: props.destination?.x, y: props.destination?.y };
            let w = props.destination?.blockWidth + 2*15*0.6/props.myDepthScale;
            let h = props.destination?.blockHeight + 2*15*0.6/props.myDepthScale;
            return calculateEdgeIntersection(A, B, w, h);
        });

        return {
            blockStyle, lineStart, lineStop, sourceBlockEdge, destinationBlockEdge,
            isSelected: computed(() => props.source!.isSelected && props.destination!.isSelected),
            isEitherSelected: computed(() => props.source!.isSelected || props.destination!.isSelected),
            deleteLink: function() {
                // Send the update request to the server
                new SetBlockParentAction({
                    blockId:       props.destination!.blockId,
                    parentBlockId: undefined,
                }).submit();
            }
        }
    },
})
</script>

<style lang="scss">
@use '../../styles/variables' as vars;

.mw-app-relationship-link {

    &.selected {
        .connecting-line { stroke: vars.$gray-very-light; fill: vars.$gray-very-light; }
    }
    line {
        stroke: vars.$gray3;
    }
    polygon {
        stroke: vars.$gray3;
        stroke-width: 6;
        stroke-linejoin: round;
        fill: vars.$gray3;
    }

    .invisible-line {
        stroke: transparent;
    }

    .delete-circle {
        opacity: 0;
        transition: 0.1s;
        transition-delay: 0.1s;
        cursor: pointer;
        fill: vars.$red4;
        line {
            stroke-width: 5;
            stroke: vars.$gray-dark;
        }
    }
    &:hover {
        .delete-circle { opacity: 1; }
    }
}
</style>
