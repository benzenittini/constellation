<template>
    <svg class="mw-svg-arrow" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" />
        <line x1="45" y1="30" x2="60" y2="50" />
        <line x1="45" y1="70" x2="60" y2="50" />
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

.mw-svg-arrow {
    cursor: pointer;
    vertical-align: middle;

    stroke: vars.$gray3;
    stroke-width: 5px;
    stroke-linecap: round;
    &:hover { stroke: vars.$gray-very-light; }
    line { stroke-width: 7px; }

    fill: vars.$gray-very-dark;
    circle { filter: drop-shadow(0px 4px 4px vars.$gray-very-dark); }
}

</style>