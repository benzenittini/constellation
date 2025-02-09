<template>
    <div class="mw-expandable-tree">
        <div class="mw-tree-title">
            <span v-on:click="isExpanded = !isExpanded">
                <span style="position: relative;">
                    <eic-svg-triangle width="12" height="12" v-bind:style="{ 'transform': `rotate(${arrowRotation}deg)` }"></eic-svg-triangle>
                </span>
                <slot name="title"></slot>
            </span>
        </div>
        <div class="mw-tree-content" v-show="isExpanded">
            <slot name="content"></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";

export default defineComponent({
    props: {
        startExpanded: Boolean,
    },
    setup(props, context) {
        let isExpanded = ref(props.startExpanded);
        let arrowRotation = computed(() => {
            return isExpanded.value ? 0 : -90;
        });

        return {
            isExpanded,
            arrowRotation,
        };
    }
})
</script>

<style lang="css">

.mw-expandable-tree {

    .mw-tree-title {
        span { cursor: pointer; }
    }

    .mw-tree-content {
        padding: 5px 18px;
    }

    .mw-svg-triangle {
        position: absolute;
        margin-left: -17px;
        margin-top: 5px;
        transition: transform 0.4s;
    }

}

</style>
