<template>
    <div class="eic-form-component mw-datetime" v-bind:class="{ 'disabled': mwDisabled }">
        <div class="eic-datetime-border" v-bind:class="{ 'eic-invalid-value': !isValid(dateVal) }">
            <input v-if="hasDate"
                v-model="dateVal"
                v-bind:disabled="mwDisabled"
                type="date"
                v-on:blur="$emit('eic-blur'); $emit('eic-val-set', { date: $event.target.value, time: timeVal });"
                v-on:focus="$emit('eic-focus')">
        </div>
        <div class="eic-datetime-border" v-bind:class="{ 'eic-invalid-value': !isValid(timeVal) }">
            <input v-if="hasTime"
                v-model="timeVal"
                v-bind:disabled="mwDisabled"
                type="time"
                v-on:blur="$emit('eic-blur'); $emit('eic-val-set', { date: dateVal, time: $event.target.value });"
                v-on:focus="$emit('eic-focus')">
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, PropType } from "vue";

import { DateTime, FieldType } from 'constellation-common/datatypes';

export default defineComponent({
    props: {
        modelValue: Object as PropType<DateTime>, // Must be "modelValue" for v-model to work
        mwFieldType: String, // one of FieldType's values
        mwDisabled: Boolean,
    },
    setup(props, context) {
        let dateVal = computed({
            get: () => props.modelValue?.date || '',
            set: val => {
                context.emit('update:modelValue', {
                    date: val,
                    time: props.modelValue?.time || ''
                });
            }
        });
        let timeVal = computed({
            get: () => props.modelValue?.time || '',
            set: val => {
                context.emit('update:modelValue', {
                    date: props.modelValue?.date || '',
                    time: val
                });
            }
        });

        return {
            dateVal, timeVal,
            hasDate: computed(() => props.mwFieldType === FieldType.DATE || props.mwFieldType === FieldType.DATETIME),
            hasTime: computed(() => props.mwFieldType === FieldType.TIME || props.mwFieldType === FieldType.DATETIME),
            isValid: (value: string) => value && value.trim().length > 0,
        }
    }
})
</script>

<style lang="css">

.mw-datetime {

    &.disabled * { cursor: not-allowed; }

    /* The bottom border - a separate "div" so it can have a cool effect when hovered. */
    .eic-datetime-border {
        display: inline-block;
        border-radius: calc(var(--component-radius) + 1px); /* +1 to hide some ugly top corners */
        padding-bottom: 1px;
        transition: background-position 0.2s ease-out; /* "ease-out" to help counteract the "roundedness" of the radial gradient */
        background: radial-gradient(51% 50% at bottom, var(--gray-very-light) 100%, var(--gray4) 100%) top;
        background-size: 100% 200%;
        &.eic-invalid-value:focus-within { background: var(--red-error) !important; }
    }
    .eic-datetime-border:focus-within {
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


</style>
