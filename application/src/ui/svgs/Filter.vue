
<template>
    <svg class="mw-svg-filter" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="33" height="33" class="mwe-filter-background" />
        <path d="M6 9V6H28V9L19 19V27H15V19L6 9Z" class="mwe-filter-icon" />
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

.mw-svg-filter {
    .mwe-filter-background { fill: vars.$gray3; }
    .mwe-filter-icon       { fill: vars.$gray-very-dark; }

    &.active {
        .mwe-filter-background { fill: vars.$gray7; }
    }
}

</style>
