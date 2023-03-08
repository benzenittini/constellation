<template>
    <div class="eic-form-component mw-textbox" v-bind:class="{ 'disabled': mwDisabled }">
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

<style lang="scss">

@use "../styles/variables" as vars;

.mw-textbox {

    &.disabled * { cursor: not-allowed; }

    // The bottom border - a separate "div" so it can have a cool effect when hovered.
    .eic-textbox-border {
        display: inline-block;
        border-radius: vars.$component-radius + 1; // +1 to hide some ugly top corners
        padding-bottom: 1px;
        width: 100%;
        transition: background-position 0.2s ease-out; // "ease-out" to help counteract the "roundedness" of the radial gradient
        background: radial-gradient(51% 50% at bottom, vars.$gray-very-light 100%, vars.$gray4 100%) top;
        background-size: 100% 201%; // It's "201%" instead of "200%" to avoid a small underline from appearing inside certain layouts, like grids.
        &.eic-invalid-value { background: vars.$red-error !important; }
    }
    .eic-textbox-border:focus-within {
        background-position: bottom;
    }

    // Standard input styling
    input {
        background: vars.$gray1;
        border-radius: vars.$component-radius;
        padding: 8px 12px;
        color: vars.$gray-very-light;
        font-size: 16px;
        border: none;
        outline: none;
        width: 100%;
    }

    // Placeholder text formatting. Firefox needs "opacity:1" or it doesn't look right.
    input::placeholder { color: vars.$gray-medium; opacity: 1; }

}


</style>
