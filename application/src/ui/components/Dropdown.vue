<template>
    <div class="mw-dropdown eic-form-component">
        <select v-model="inputVal"
            v-bind:disabled="mwDisabled"
            v-bind:class="{ 'mw-scrollbars': true, 'disabled': mwDisabled, 'eic-invalid-value': isValid && !isValid(inputVal), 'mw-multi-select': mwMultiple }"
            v-bind:multiple="mwMultiple"
            v-on:blur="$emit('eic-blur')"
            v-on:focus="$emit('eic-focus')">
            <option v-if="mwPlaceholder" v-bind:value="mwPlaceholder" disabled>{{ mwPlaceholder }}</option>
            <option v-if="mwClearable" class="mw-unset" v-bind:key="undefined" v-bind:value="null">(unset)</option>
            <option v-for="opt in ungroupedOptions"
                v-bind:key="opt.value"
                v-bind:value="opt.value"
                v-bind:disabled="opt.disabled">{{opt.display ?? opt.value}}</option>

            <optgroup v-for="group in groupedOptions" v-bind:label="group.label" v-bind:key="group.label">
                <option v-for="opt in group.options"
                    v-bind:key="opt.value"
                    v-bind:value="opt.value"
                    v-bind:disabled="opt.disabled">{{opt.display ?? opt.value}}</option>
            </optgroup>
        </select>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, watch, Ref, ref } from "vue";

import { DropdownOption } from "../store/Types/FieldStoreTypes";

export default defineComponent({
    props: {
        modelValue: [String, Array], // Must be "modelValue" for v-model to work
        eicOptions: Array, // [ {display: "One!", value: "one", disabled?: false, group?: "Group 1"}, ... ]
        isValid: Function,
        mwDisabled: Boolean,
        mwMultiple: Boolean,
        mwPlaceholder: String,
        mwClearable: Boolean,
    },
    setup(props, context) {
        let inputVal = computed({
            get: () => props.modelValue,
            set: val => {
                context.emit('update:modelValue', val);
                context.emit('eic-val-set', val);
            }
        });

        let ungroupedOptions: Ref<DropdownOption[]> = ref([]);
        let groupedOptions: Ref<{ label: string, options: DropdownOption[] }[]> = ref([]);

        function updateOptions(opts: DropdownOption[]) {
            ungroupedOptions.value = [];
            groupedOptions.value = [];
            opts.forEach(opt => {
                if (opt.group) {
                    let group = groupedOptions.value.find(g => g.label === opt.group);
                    if (!group) {
                        group = { label: opt.group, options: [] };
                        groupedOptions.value.push(group);
                    }
                    group.options.push(opt);
                } else {
                    ungroupedOptions.value.push(opt);
                }
            });
        }
        // Initial population
        updateOptions(props.eicOptions as DropdownOption[]);

        // Need to watch the eicOptions prop because some of our uses the bound value changes.
        watch(() => props.eicOptions, (newVal) => {
            updateOptions(newVal as DropdownOption[]);
        });


        return {
            inputVal,
            ungroupedOptions,
            groupedOptions,
        }
    }
})
</script>

<style lang="css">

.mw-dropdown {
    select {
        background-color: var(--gray1);
        color: var(--gray-very-light);
        border: none;
        border-bottom: 1px solid var(--gray4);
        border-radius: var(--component-radius);
        padding: 8px 12px;
        outline: none;

        font-size: 16px;

        width: 100%;

        /* Replace the default arrow with our own */
        &:not(.mw-multi-select) {
            appearance: none;
            /* This is the SVG for our arrow:
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
                   <polygon fill="var(--gray3)" points="0,0 10,0 5,8" />
               </svg>
            */
            background-image: url("data:image/svg+xml, <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 10 10\"> <polygon fill=\"hsla(248, 8%, 35%, 1)\" points=\"0,1 10,1 5,9\" /> </svg>");
            background-repeat: no-repeat;
            background-position: center right 6px;
            background-size: 13px;
            padding-right: 25px; /* extra right padding for our dropdown arrow. */
        }

        &:focus { border-color: var(--gray-very-light); }
        &.eic-invalid-value { border-color: var(--red4) !important; }
        &.disabled { cursor: not-allowed; }

        .mw-unset { color: var(--gray4); }
    }
}

</style>
