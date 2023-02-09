<template>
    <svg class="mw-svg-magnifyingglass" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect x="0" y="0" width="25" height="25" stroke="transparent" fill="transparent" />

        <!-- The rest of the magnifying glass -->
        <circle cx="16.5" cy="8.5" r="7"/>
        <path d="M12 13L2 23"/>
        <path class="glare" d="M13 8.5C13.5379 6.09355 14.3689 5.21991 17 5"/>
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

.mw-svg-magnifyingglass {
    stroke: vars.$gray3;
    stroke-width: 3;
    .glare { stroke-width: 1; }
}

</style>