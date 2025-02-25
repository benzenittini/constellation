<template>
    <svg class="mw-svg-arrow2" viewBox="0 0 30 30">
        <line x1="4" y1="15" x2="26" y2="15" />
        <line x1="20" y1="11" x2="26" y2="15" />
        <line x1="20" y1="19" x2="26" y2="15" />
    </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    setup() {
        return {}
    },
})
</script>

<style>

.mw-svg-arrow2 {
    vertical-align: middle;

    stroke: var(--gray3);
    stroke-width: 3px;
    stroke-linecap: round;
}

</style>