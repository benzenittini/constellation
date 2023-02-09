<template>
    <svg class="mw-svg-paper" viewBox="0 0 31 37" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect x="0" y="0" width="31" height="37" stroke="transparent" fill="transparent" />

        <!-- The rest of the icon -->
        <path d="M12 1H28C29.1046 1 30 1.89543 30 3V34C30 35.1046 29.1046 36 28 36H3C1.89543 36 1 35.1046 1 34V12M12 1V10C12 11.1046 11.1046 12 10 12H1M12 1L1 12" stroke-width="2"/>
        <path d="M7 29.5H24.5M7 23H16H24.5M24.5 16.5H20H12H7M24.5 10H17.5H12" stroke-linejoin="round"/>
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

.mw-svg-paper {
    stroke: vars.$gray3;

    &.active {
        stroke: vars.$gray-very-light;
    }
}

</style>