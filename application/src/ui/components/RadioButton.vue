<template>
    <div class="eic-form-component mw-radiobutton">
        <label v-bind:class="{ disabled: mwDisabled }">
            <input type="radio" v-bind:disabled="mwDisabled" v-bind:name="eicGroup" v-bind:value="eicRadioValue" v-model="inputVal" />
            <div class="outer-circle"><div class="inner-circle"></div></div>
            <span class="text">{{ eicLabel }}</span>
        </label>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

export default defineComponent({
    props: {
        modelValue: String, // Must be "modelValue" for v-model to work
        eicGroup: String,
        eicLabel: String,
        eicRadioValue: String,
        mwDisabled: Boolean,
    },
    setup(props, context) {
        let inputVal = computed({
            get: () => props.modelValue,
            set: val => {
                context.emit('update:modelValue', val);
                context.emit('eic-val-set', val);
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

.mw-radiobutton {
    label.disabled { cursor: not-allowed; }

    // Hide the actual radiobutton
    input[type="radio"] { display: none; }

    // General styling of the pieces
    .outer-circle {
        display: inline-flex;
        margin-bottom: 5px;
        border: 2px solid vars.$gray4;
        border-radius: 50px;
        padding: 3px;
    }
    .inner-circle {
        width: 0.6em;
        height: 0.6em;
        border-radius: 50px;
    }
    .text {
        margin-left: 8px;
        color: vars.$gray4;
        font-size: 1.0rem;
        vertical-align: middle;
    }

    // Make things white when checked
    label :checked + .outer-circle {
        border-color: vars.$gray-very-light;
    }
    label :checked + .outer-circle .inner-circle {
        background: vars.$gray-very-light;
    }
    label :checked ~ .text {
        color: vars.$gray-very-light;
    }
}

</style>
