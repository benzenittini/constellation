<template>
    <div class="eic-form-component mw-textbox" v-bind:class="{ 'disabled': mwDisabled, 'mw-phantom-textbox': mwPhantom }">
        <div class="eic-textbox-border" v-bind:class="{ 'eic-invalid-value': isValid && !isValid(inputVal) }">
            <input v-model="inputVal"
                v-bind:disabled="mwDisabled"
                v-bind:id="mwId"
                v-bind:type="mwType"
                v-bind:placeholder="eicPlaceholder"
                v-bind="mwInputExtras"
                v-on:blur="$emit('eic-blur'); $emit('eic-val-set', $event.target.value);"
                v-on:focus="$emit('eic-focus')">
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

export default defineComponent({
    props: {
        modelValue: [String, Number], // Must be "modelValue" for v-model to work
        eicPlaceholder: String,
        mwType: {
            type: String, // "password", "number", etc.
            default: "text",
        },
        mwInputExtras: Object, // Extra things bound to the input component (ex: min, max, ...)
        isValid: Function,
        mwDisabled: Boolean,
        mwPhantom: Boolean,
        mwId: String, // Useful for attaching labels to this input
    },
    setup(props, context) {
        let inputVal = computed({
            get: () => props.modelValue,
            set: val => { context.emit('update:modelValue', val); }
        });

        return {
            inputVal,
        }
    }
})
</script>

<style>

.mw-textbox {

    &.disabled * { cursor: not-allowed; }

    /* The bottom border - a separate "div" so it can have a cool effect when hovered. */
    .eic-textbox-border {
        display: inline-block;
        border-radius: calc(var(--component-radius) + 1px); /* +1 to hide some ugly top corners */
        padding-bottom: 1px;
        width: 100%;
        transition: background-position 0.2s ease-out; /* "ease-out" to help counteract the "roundedness" of the radial gradient */
        background: radial-gradient(51% 50% at bottom, var(--gray-very-light) 100%, var(--gray4) 100%) top;
        background-size: 100% 201%; /* It's "201%" instead of "200%" to avoid a small underline from appearing inside certain layouts, like grids. */
        &.eic-invalid-value { background: var(--red-error) !important; }
    }
    .eic-textbox-border:focus-within {
        background-position: bottom;
    }

    /* Standard input styling */
    input {
        background: var(--gray1);
        border-radius: var(--component-radius);
        padding: 8px 12px;
        color: var(--gray-very-light);
        font-size: 16px;
        border: none;
        outline: none;
        width: 100%;
    }

    /* Placeholder text formatting. Firefox needs "opacity:1" or it doesn't look right. */
    input::placeholder { color: var(--gray-medium); opacity: 1; }

}

.mw-textbox.mw-phantom-textbox {
    .eic-textbox-border {
        background: transparent;
    }
    input {
        border-color: transparent;
        background: transparent;
        transition: border-color 0.4s;
        &:hover:not(:focus) { border-bottom: 1px solid var(--gray4); }
        &:focus {
            background: var(--gray1);
            border-bottom: 1px solid var(--gray-very-light);
        }
    }
}


</style>
