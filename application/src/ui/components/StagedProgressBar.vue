<template>
    <svg class="mw-stagedprogressbar">

        <line v-for="(line, li) in lines"
            v-bind:key="'line-' + line.stageId"
            v-bind:x1="line.x1"
            v-bind:x2="line.x2"
            v-bind:y1="line.y"
            v-bind:y2="line.y"
            v-bind:class="{ active: isCurrentStage(line.stageId), completed: isStageComplete(li) }"
            />

        <circle v-for="(circle, ci) in circles"
            v-bind:key="'circle-' + circle.stageId"
            v-bind:r="circle.r"
            v-bind:cy="circle.cy"
            v-bind:cx="circle.cx"
            v-bind:class="{ active: isCurrentStage(circle.stageId), completed: isStageComplete(ci) }"
            />

        <g v-for="(stage, i) in stages"
            v-bind:key="'text-' + stage.id">
            <text v-for="(word, wi) in stage.text.split(' ')"
                v-bind:key="'text-' + stage.id + '-' + wi"
                text-anchor="middle"
                v-bind:x="getCX(i)"
                v-bind:y="getWordY(wi)"
                v-bind:class="{ active: isCurrentStage(stage.id) }"
                >{{ word }}</text>
        </g>

    </svg>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

export default defineComponent({
    props: {
        mwStages: {
            type: Array, // { id: string, text: string }[]
        },
        mwCurrentStage: {
            type: String,
        },
    },
    setup(props) {
        const CIRCLE_RADIUS = 20;
        const CIRCLE_Y_SHIFT = CIRCLE_RADIUS + 5;

        const stages = computed(() => props.mwStages as { id: string, text: string }[]);
        const currentStage = computed(() => props.mwCurrentStage as string);

        function getCX(index: number) {
            let percentGap = 1.0 / stages.value.length;
            let shifted = (percentGap * index) + (percentGap / 2);
            return Math.floor(shifted * 100) + "%";
        }
        function getWordY(wordIndex: number) {
            return 30 + CIRCLE_RADIUS*2 + wordIndex*22;
        }

        const circles = computed(() => {
            return stages.value.map((stage: any, index: number) => ({
                stageId: stage.id,
                r: CIRCLE_RADIUS,
                cx: getCX(index),
                cy: CIRCLE_Y_SHIFT,
            }));
        });

        const lines = computed(() => {
            const svgLines = [];
            for (let i = 1; i < stages.value.length; i++) {
                svgLines.push({
                    stageId: stages.value[i].id,
                    x1: getCX(i-1),
                    x2: getCX(i),
                    y: CIRCLE_Y_SHIFT,
                });
            }
            return svgLines;
        });

        return {
            stages,
            circles, lines,

            getCX, getWordY,
            isStageComplete: (index: number) => index < stages.value.findIndex((stage: any) => stage.id === currentStage.value),
            isCurrentStage: (stageId: string) => stageId === currentStage.value,
        }
    }
})
</script>

<style lang="scss">
@use "../styles/variables" as vars;

.mw-stagedprogressbar {
    $stroke-width: 4px;
    $transition-speed: 0.4s;

    width: 100%;
    display: block;
    margin: 0 auto;
    height: 120px;

    line {
        transition: $transition-speed;
        stroke-width: $stroke-width;
        stroke: vars.$gray3;
        &.completed { stroke: vars.$gray-very-light; }
    }
    circle {
        transition: $transition-speed;
        stroke-width: $stroke-width;
        stroke: vars.$gray3;
        fill: vars.$gray-very-dark;

        &.completed { fill: vars.$gray-very-light; stroke: vars.$gray-very-light; }
        &.active { stroke: vars.$gray-very-light; }
    }
    text {
        transition: $transition-speed;
        fill: vars.$gray3;
        font-weight: bold;
        letter-spacing: 1px;
        &.active { fill: vars.$gray-very-light; }
    }
}

</style>