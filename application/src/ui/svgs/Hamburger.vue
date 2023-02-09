<template>
    <svg class="mw-svg-hamburger" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect x="0" y="0" width="19" height="19" stroke="transparent" fill="transparent" />

        <!-- This is the burger -->
        <line x1="1.5" y1="1.5"  x2="17.5" y2="1.5"  stroke-width="3" stroke-linecap="round"/>
        <line x1="1.5" y1="9.5"  x2="17.5" y2="9.5"  stroke-width="3" stroke-linecap="round"/>
        <line x1="1.5" y1="17.5" x2="17.5" y2="17.5" stroke-width="3" stroke-linecap="round"/>
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

.mw-svg-hamburger {
    transition: stroke 0.2s;
    stroke: vars.$gray3;

    &.active {
        stroke: vars.$gray-very-light;
    }
}

</style>