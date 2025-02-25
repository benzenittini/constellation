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

<style>
.mw-hr {
    height: 2px;
    background-color: var(--gray-dark);
    border-radius: var(--radius-small);
}
</style>
