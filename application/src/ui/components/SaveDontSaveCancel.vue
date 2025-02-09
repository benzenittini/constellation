<template>
    <div class="mw-savedontsavecancel">
        <button class="tertiary pink" v-on:click="$emit('mw-cancel', $event)">{{ mwCancelText }}</button>
        <button class="secondary pink" v-on:click="$emit('mw-dont-save', $event)">{{ mwDontSaveText }}</button>
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
        mwDontSaveText: {
            type: String,
            default: "Don't Save"
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

<style lang="css">

.mw-savedontsavecancel {
    background: var(--gray-very-dark);
    border-radius: var(--dialog-section-radius);
    margin-top: var(--dialog-section-gap);
    padding: 5px 10px;

    text-align: right;
    button { margin: 10px; }
}

</style>