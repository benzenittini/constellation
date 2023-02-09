<template>
    <svg class="mw-svg-equalizewidths" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect class="invisible-bounds" x="0" y="0" width="20" height="20" fill="transparent" stroke="none" />

        <!-- These make up the actual icon -->
        <path class="arrow" stroke-width="1" d="M 8 16 H 19 M 19 16 L 13 12 M 19 16 L 13 20"/>
        <rect class="block" stroke-width="2" x="1" y="1" width="18" height="7"/>
        <rect class="block" stroke-width="2" x="1" y="12" width="6" height="7"/>
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

.mw-svg-equalizewidths {
    stroke: vars.$gray3;
    fill: none;

    .block {
        fill: vars.$gray3;
    }
}

</style>