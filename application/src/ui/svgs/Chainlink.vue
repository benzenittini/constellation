<template>
    <svg class="mw-svg-chainlink" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect class="invisible-bounds" x="0" y="0" width="20" height="20" stroke="none" />

        <!-- These make up the actual icon -->
        <path d="M 7 9 l -7 7 v 2 l 2 2 h 2 l 7 -7" /> <!-- Bottom-left link -->
        <path d="M 6 14 l 8 -8" /> <!-- Middle link -->
        <path d="M 9 7 l 7 -7 h 2 l 2 2 v 2 l -7 7" /> <!-- Upper-right link -->
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

<style lang="scss">
@use "../styles/variables" as vars;

.mw-svg-chainlink {
    stroke: vars.$gray3;
    stroke-width: 2;
    fill: transparent;
}

</style>