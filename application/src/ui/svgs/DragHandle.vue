<template>
    <svg class="mw-svg-draghandle" viewBox="0 0 100 100">
        <circle cx="25" cy="10" r="10" />
        <circle cx="75" cy="10" r="10" />

        <circle cx="25" cy="50" r="10" />
        <circle cx="75" cy="50" r="10" />

        <circle cx="25" cy="90" r="10" />
        <circle cx="75" cy="90" r="10" />
    </svg>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

export default defineComponent({
    setup() {
        return {}
    },
    methods: {
    }
})
</script>

<style lang="css">

.mw-svg-draghandle {
    transition: opacity 0.2s;
    cursor: move;
    vertical-align: middle;

    stroke: var(--gray3);
    fill: var(--gray3);
}

</style>