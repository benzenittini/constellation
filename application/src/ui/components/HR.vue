<template>
    <div class="mw-hr">
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

export default defineComponent({
    setup(props, context) {
        return {};
    },
});
</script>

<style lang="scss">

@use "../styles/variables" as vars;

.mw-hr {
    height: 4px;
    background-color: vars.$gray-dark;
    border-radius: vars.$radius-small;
}
</style>
