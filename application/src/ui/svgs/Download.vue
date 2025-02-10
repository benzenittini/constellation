<template>
    <svg class="mw-svg-download" viewBox="0 0 60 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect class="mw-background" x="0" y="0" width="60" height="64" stroke="transparent" fill="transparent" />

        <rect class="mw-drive" y="54" width="60" height="10" rx="4" />
        <path class="mw-arrow" d="M34 4C34 1.79086 32.2091 9.82295e-08 30 0C27.7909 -9.82295e-08 26 1.79086 26 4L34 4ZM27.1716 51.8284C28.7337 53.3905 31.2663 53.3905 32.8284 51.8284L58.2843 26.3726C59.8464 24.8105 59.8464 22.2778 58.2843 20.7157C56.7222 19.1536 54.1895 19.1536 52.6274 20.7157L30 43.3431L7.37258 20.7157C5.81049 19.1536 3.27783 19.1536 1.71573 20.7157C0.153631 22.2778 0.153631 24.8105 1.71573 26.3726L27.1716 51.8284ZM26 4L26 49L34 49L34 4L26 4Z" />
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
.mw-svg-download {
    .mw-drive, .mw-arrow { fill: var(--gray3); }
    &:hover {
        .mw-drive, .mw-arrow { fill: var(--gray-very-light); }
    }
}
</style>