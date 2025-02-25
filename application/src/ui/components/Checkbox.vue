<template>
    <div class="mw-checkbox eic-form-component" v-bind:class="{ 'disabled': mwDisabled }">
        <label>
            <input type="checkbox" v-bind:disabled="mwDisabled" v-model="inputVal" v-on:click.stop />
            <div class="outer-box"><div v-bind:class="{ 'inner-box': true, 'enable-fill': enableFill }"></div></div>
            <span class="text">{{ eicLabel }}</span>
        </label>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from "vue";

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

        let enableFill = ref(inputVal.value);
        setTimeout(() => enableFill.value = true, 500);

        return {
            inputVal,
            enableFill,
        }
    },
    methods: {
    }
})
</script>

<style>

.mw-checkbox {

    /* Hide the actual checkbox */
    input[type="checkbox"] { display: none; }

    /* General styling of the pieces */
    .outer-box {
        margin-bottom: 5px;
        display: inline-flex;
        border: 2px solid var(--gray4);
        border-radius: 4px;
        padding: 3px;
        position: relative;
        width: 1.2em;
        height: 1.2em;
    }
    .inner-box {
        width: 100%;
        height: 100%;
        animation: 0.3s forwards spring-out;
        &.enable-fill { background: var(--gray-very-light); }
    }
    .text {
        margin-left: 8px;
        color: var(--gray4);
        font-size: 1.0rem;
        vertical-align: middle;
    }

    /* Make things white when checked */
    label :checked ~ .text                 { color: var(--gray-very-light); }
    label :checked + .outer-box            { border-color: var(--gray-very-light); }
    label :checked + .outer-box .inner-box { animation: 0.3s spring-in; }

    &.disabled * { cursor: not-allowed; }
}

</style>
