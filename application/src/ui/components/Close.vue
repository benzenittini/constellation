<template>
    <div class="mw-close">
        <button class="primary pink" v-on:click="$emit('mw-close', $event)">Close</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {},
    setup() {
        return {}
    }
})
</script>

<style lang="css">

.mw-close {
    background: var(--gray-very-dark);
    border-radius: var(--dialog-section-radius);
    margin-top: var(--dialog-section-gap);
    padding: 5px 35px;

    text-align: right;
    button { margin: 10px; }
}

</style>