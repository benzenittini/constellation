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

<style>

.mw-savecancel {
    background: var(--gray-very-dark);
    border-radius: var(--dialog-section-radius);
    margin-top: var(--dialog-section-gap);
    padding: 5px 35px;

    text-align: right;
    button { margin: 10px; }
}

</style>