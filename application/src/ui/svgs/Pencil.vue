<template>
    <svg class="mw-svg-pencil" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect x="0" y="0" width="22" height="22" fill="transparent" stroke="none"/>

        <!-- These make up the actual icon -->
        <path stroke-width="2" d="M13.5581 5.77273L2.62785 16.4545L1.93018 19.8636L5.18599 19.1818L16.1162 8.5M13.5581 5.77273L16.1162 8.5M13.5581 5.77273L17.279 2.13636L19.8372 4.86363L16.1162 8.5"/>
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

.mw-svg-pencil {
    stroke: var(--gray3);
    &:hover {
        stroke: var(--gray-very-light);
    }
}

</style>