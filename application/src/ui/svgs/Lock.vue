<template>
    <svg class="mw-svg-lock" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect x="0" y="0" width="20" height="20" stroke="transparent" fill="transparent" />

        <!-- This terrifying string draws the lock -->
        <path d="M6.5 7.75H3V19H17V7.75H13.5M6.5 7.75V4.15C6.5 4.15 6.36313 1 10 1C13.6369 1 13.5 4.15 13.5 4.15V7.75M6.5 7.75H13.5" stroke-width="2"/>
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

<style lang="css">

.mw-svg-lock {
    stroke: var(--gray3);

    &.active {
        stroke: var(--gray-very-light);
    }
}

</style>