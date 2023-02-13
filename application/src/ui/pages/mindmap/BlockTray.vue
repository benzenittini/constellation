<template>
    <g v-bind:style="{opacity: isVisible ? 1 : 0, transition: 'opacity 0.2s'}" data-test="block-tray" class="mw-app-relationship-blocktray">
        <!-- Each icon should be 20px by 20px with 10px between them. -->
        <rect class="block-tray-background" rx="5" x="5" y="5" v-bind:width="numberOfIcons * 30" height="30" />

        <!-- Create/Link Block -->
        <!-- TODO-later : Enable block linking -->
        <!-- v-on:mousedown="$emit('blockTrayDragStart', { mouseEvent: $event, metadata: {type: 'setCreateLink', sourceBlockId: blockId, sourceBoudingBox: blockBoundingBox} })" -->
        <!-- <eic-svg-chainlink class="mw-icon" data-test="block-tray-set-create-link" style="cursor: not-allowed;"></eic-svg-chainlink> -->

        <!-- Show Preview / Expand Block -->
        <g class="mw-magnifying-wrapper">
            <eic-svg-magnifying-glass width="20" height="20" class="mw-icon"
                v-bind:class="{ 'show-active': isExpanded }"
                v-on:mouseover="startPreviewTimer()"
                v-on:mouseleave="cancelPreviewTimer()"
                v-on:click="$emit('toggleExpansion')"
                ></eic-svg-magnifying-glass>
            <title>Hover to expand this block. Click to lock open.</title>
        </g>

        <!-- Create/Set Child -->
        <g class="mw-hierarchy-wrapper">
            <eic-svg-hierarchy-symbol width="20" height="20" class="mw-icon"
                data-test="block-tray-set-create-child"
                v-on:mousedown="$emit('blockTrayDragStart', { mouseEvent: $event, metadata: {type: 'setCreateChild', sourceBlockId: blockId, sourceBoundingBox: blockBoundingBox} })"
                ></eic-svg-hierarchy-symbol>
            <title>Drag this to create a child block.</title>
        </g>
    </g>
</template>

<script lang="ts">

import { computed, defineComponent, Ref, ref } from "vue";

export default defineComponent({
    emits: [ 'blockTrayDragStart', 'showPreview', 'toggleExpansion' ],
    props: {
        isVisible: Boolean,
        blockId: String,
        blockBoundingBox: Object,
        isExpanded: Boolean,
    },
    setup(props, context) {

        let previewTimer: Ref<any | undefined> = ref(undefined);
        let startPreviewTimer = () => {
            if (previewTimer.value === undefined) {
                previewTimer.value = setTimeout(() => context.emit('showPreview'), 250);
            }
        };
        let cancelPreviewTimer = () => {
            if (previewTimer.value !== undefined) {
                clearTimeout(previewTimer.value);
                previewTimer.value = undefined;
            }
        }

        return {
            startPreviewTimer, cancelPreviewTimer,

            numberOfIcons: 2,
        }
    },
})
</script>

<style lang="scss">
@use '../../styles/variables' as vars;

.mw-app-relationship-blocktray {
    .block-tray-background {
        fill: vars.$gray-very-dark;
    }

    .mw-svg-magnifyingglass.show-active {
        stroke: vars.$pink-medium;
    }

    .mw-icon {
        &:hover:not(.show-active) { stroke: vars.$gray-very-light; }
        cursor: pointer;
    }
    .mw-magnifying-wrapper { transform: translate(10px, 10px); }
    .mw-hierarchy-wrapper  { transform: translate(40px, 10px); }

}
</style>