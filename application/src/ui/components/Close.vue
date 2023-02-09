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

<style lang="scss">
@use "../styles/variables" as vars;

.mw-close {
    background: vars.$gray-very-dark;
    border-radius: vars.$dialog-section-radius;
    margin-top: vars.$dialog-section-gap;
    padding: 5px 35px;

    text-align: right;
    button { margin: 10px; }
}

</style>