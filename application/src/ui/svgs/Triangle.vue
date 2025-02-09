<template>
    <svg class="mw-svg-triangle" viewBox="0 0 10 10">
        <!-- (By default, the triangle points down.) -->
        <polygon points="0,0 10,0 5,8" />
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

.mw-svg-triangle {
    fill: var(--gray3);
}

</style>