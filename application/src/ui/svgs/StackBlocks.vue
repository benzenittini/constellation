<template>
    <svg class="mw-svg-stackblocks" viewBox="0 0 10 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect x="0" y="0" width="10" height="30" fill="transparent" stroke="none"/>

        <!-- These make up the actual icon -->
        <rect class="block" x="0" y="0" width="10" height="8" />
        <rect class="block" x="0" y="11" width="10" height="8" />
        <rect class="block" x="0" y="22" width="10" height="8" />
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

.mw-svg-stackblocks {
    fill: none;

    .block { fill: vars.$gray3; }
}

</style>