<template>
    <svg class="mw-svg-speechbubble" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect x="0" y="0" width="25" height="24" stroke="transparent" fill="transparent" />

        <!-- The rest of the speech bubble -->
        <path d="M21 1H4C2.34315 1 1 2.34315 1 4V13C1 14.6569 2.34315 16 4 16H6.13725L3 22.5L12 16H21C22.6569 16 24 14.6569 24 13V4C24 2.34315 22.6569 1 21 1Z" stroke-width="2" stroke-linejoin="round"/>
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

.mw-svg-speechbubble {
    stroke: vars.$gray3;

    &.active {
        stroke: vars.$gray-very-light;
    }
}

</style>