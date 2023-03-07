<template>
    <svg class="mw-svg-deletionx" viewBox="0 0 22 22">
        <circle cx="11" cy="11" r="11" />
        <line x1="6" y1="6" x2="16" y2="16" />
        <line x1="6" y1="16" x2="16" y2="6" />
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

.mw-svg-deletionx {
    vertical-align: middle;
    cursor: pointer;

    * { transition: 0.2s; }
    circle { fill: transparent; stroke: transparent; }
    line { fill: transparent; stroke: vars.$gray3; stroke-width: 3; }
    &:hover {
        circle { fill: vars.$red4; }
        line { stroke: vars.$gray-very-dark; }
    }

    &.inversion {
        circle { fill: vars.$red4; }
        line { stroke: vars.$gray-very-dark; }
        &:hover {
            circle { fill: vars.$red6; }
        }
    }
}

</style>