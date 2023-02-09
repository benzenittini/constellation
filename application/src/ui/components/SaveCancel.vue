<template>
    <div class="mw-savecancel">
        <button class="tertiary gray" v-on:click="$emit('mw-cancel', $event)">{{ mwCancelText }}</button>
        <button class="primary pink" v-on:click="$emit('mw-save', $event)">{{ mwSaveText }}</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        mwCancelText: {
            type: String,
            default: 'Cancel'
        },
        mwSaveText: {
            type: String,
            default: 'Save'
        },
    },
    setup() {
        return {}
    }
})
</script>

<style lang="scss">
@use "../styles/variables" as vars;

.mw-savecancel {
    background: vars.$gray-very-dark;
    border-radius: vars.$dialog-section-radius;
    margin-top: vars.$dialog-section-gap;
    padding: 5px 35px;

    text-align: right;
    button { margin: 10px; }
}

</style>