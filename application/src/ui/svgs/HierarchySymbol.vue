<template>
    <svg class="mw-svg-hierarchysymbol" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect x="0" y="0" width="20" height="20" stroke="transparent" fill="transparent" />

        <!-- The rest of the icon -->
        <path d="M6 9V15.5H11"/>
        <rect rx="1" x="1" y="1" width="13" height="7"/>
        <rect rx="1" x="11" y="12" width="8" height="7"/>
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

.mw-svg-hierarchysymbol {
    stroke: var(--gray3);
    stroke-width: 2;
    fill: transparent;
}

</style>