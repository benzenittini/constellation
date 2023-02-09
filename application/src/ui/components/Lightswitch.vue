<template>
    <div class="eic-form-component mw-lightswitch">
        <span class="text-label"
            v-on:click="inputVal = false"
            v-bind:class="{ 'selected-option': !modelValue }">{{ eicFalseLabel }}</span>

        <div class="mw-switch-container"
            v-bind:class="{ 'selected-option': modelValue }"
            v-on:click="inputVal = !inputVal">
            <div class="mw-switch"></div>
        </div>

        <span class="text-label"
            v-on:click="inputVal = true"
            v-bind:class="{ 'selected-option': modelValue }">{{ eicTrueLabel }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

export default defineComponent({
    props: {
        modelValue: Boolean, // Must be "modelValue" for v-model to work
        eicTrueLabel: String,
        eicFalseLabel: String,
    },
    setup(props, context) {
        let inputVal = computed({
            get: () => props.modelValue,
            set: val => {
                context.emit('update:modelValue', val);
                context.emit('eic-val-set', { isSelected: val });
            }
        });

        return {
            inputVal,
        }
    },
    methods: {
    }
})
</script>

<style lang="scss">

@use "sass:math";
@use "../styles/variables" as vars;

.mw-lightswitch {
    $switch-width: 45px;

    // Make all the text non-selectable
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;

    text-align: center;
    font-size: 1.2em;

    .mw-switch-container {
        display: inline-block;
        border: 1px solid vars.$gray5;
        height: 1.2em;
        width: $switch-width;
        padding: 2px;
        margin: 0 5px;
        border-radius: 7px;
        vertical-align: middle;
        cursor: pointer;
    }
    .mw-switch {
        background: vars.$gray5;
        width: 50%;
        height: 100%;
        border-radius: 5px;
        transition: 0.4s;
    }
    span {
        color: vars.$gray5;
        cursor: pointer;
    }

    .selected-option {
        &.text-label {
            color: vars.$gray-very-light;
        }
        &.mw-switch-container {
            border-color: vars.$gray-very-light;
        }
        .mw-switch  {
            background-color: vars.$gray-very-light;
            transform: translateX(math.div(($switch-width - 4), 2));
        }
    }
}

</style>
