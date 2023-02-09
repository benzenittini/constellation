<template>
    <svg class="mw-svg-plus" viewBox="0 0 100 100">
        <line x1="10" y1="50" x2="90" y2="50" />
        <line x1="50" y1="10" x2="50" y2="90" />
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

.mw-svg-plus {
    stroke: vars.$gray3;
    stroke-width: 7px;
    stroke-linecap: round;
}

</style>