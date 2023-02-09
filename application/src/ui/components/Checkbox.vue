<template>
    <div class="mw-checkbox eic-form-component" v-bind:class="{ 'disabled': mwDisabled }">
        <label>
            <input type="checkbox" v-bind:disabled="mwDisabled" v-model="inputVal" v-on:click.stop />
            <div class="outer-box"><div class="inner-box"></div></div>
            <span class="text">{{ eicLabel }}</span>
        </label>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

export default defineComponent({
    props: {
        modelValue: Boolean, // Must be "modelValue" for v-model to work
        eicLabel: String,
        eicUnderlyingValue: String, // Only needed for emitting events
        mwDisabled: Boolean,
    },
    setup(props, context) {
        let inputVal = computed({
            get: () => props.modelValue,
            set: val => {
                context.emit('update:modelValue', val);
                context.emit('eic-val-set', { value: props.eicUnderlyingValue, isSelected: val });
            }
        });

        return {
            inputVal
        }
    },
    methods: {
    }
})
</script>

<style lang="scss">
@use "../styles/variables" as vars;

.mw-checkbox {
    // Hide the actual checkbox
    input[type="checkbox"] { display: none; }

    // General styling of the pieces
    .outer-box {
        margin-bottom: 5px;
        display: inline-flex;
        border: 2px solid vars.$gray4;
        border-radius: 4px;
        padding: 3px;
        position: relative;
        width: 1.2em;
        height: 1.2em;
    }
    .inner-box {
        width: 100%;
        height: 100%;
    }
    .text {
        margin-left: 8px;
        color: vars.$gray4;
        font-size: 1.0rem;
        vertical-align: middle;
    }

    // Make things white when checked
    label :checked + .outer-box            { border-color: vars.$gray-very-light; }
    label :checked + .outer-box .inner-box { background: vars.$gray-very-light; }
    label :checked ~ .text                 { color: vars.$gray-very-light; }

    &.disabled * { cursor: not-allowed; }
}

</style>
