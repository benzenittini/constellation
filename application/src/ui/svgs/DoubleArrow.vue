<template>
    <svg class="mw-svg-doublearrow" viewBox="0 0 14 15">
        <path d="M1 1L7 7L13 1M1 7L7 13L13 7" />
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

.mw-svg-doublearrow {
    fill: transparent;
    stroke: vars.$gray-very-light;
    stroke-width: 2px;
}

</style>