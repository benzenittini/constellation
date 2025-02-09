<template>
    <div class="mw-app-dynamicfield">
        <component
            v-for="element in elements"
            v-bind:key="keyPrefix + element.key"
            v-bind:is="element.type"
            v-bind="element.data"
            v-model="element.model"
            v-on:eic-val-set="setValue($event)"></component>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ComputedRef } from "vue";

import { useStore } from "../store/store";
import { DataType, DateTime, FieldDefinition, FieldType, getFieldDataType, TypedMap } from 'constellation-common/datatypes';
import { StringUtils } from 'constellation-common/utilities';
import { DropdownOption } from "../store/Types/FieldStoreTypes";

type ElementType = {
    key: string,
    type: string,
    data: any,
    model?: any
};

export default defineComponent({
    props: {
        eicFieldDef: Object, // Should match FieldDataTypes.FieldDefinition
        possibleValueCounts: Object, // { pvCounts: { 'val1': 2, null: 3, ... }, outOf: 5 }
        keyPrefix: String,
        mwDisabled: Boolean,
    },
    setup(props, context) {
        let store = useStore();
        let possibleValueDefs = computed(() => store.getters.possibleValues);

        const componentTypeLookup: TypedMap<string> = {
            [FieldType.TEXTBOX]:       "eic-textbox",
            [FieldType.TEXT_EDITOR]:   "eic-markdowneditor",
            [FieldType.DROPDOWN]:      "eic-dropdown",
            [FieldType.RADIO_BUTTONS]: "eic-radiobutton",
            [FieldType.CHECKBOXES]:    "eic-checkbox",
            [FieldType.DATE]:          "eic-datetime",
            [FieldType.TIME]:          "eic-datetime",
            [FieldType.DATETIME]:      "eic-datetime",
        };

        // ========================================================================================
        // ----- Textbox -&- Text Editor ----------------------------------------------------------
        // - If all selected blocks match, show value. Else, show "[various]".
        // - PVs don't matter.
        //
        // ----- Temporal Fields ------------------------------------------------------------------
        // - If all selected blocks' dates match, show the date. Else, show empty date selector
        //     and a dropdown with all the dates and their counts.
        // - If all selected blocks' times match, show the time. Else, show empty time selector
        //     and a dropdown with all the times and their counts.
        // - PVs don't matter.
        //
        // ----- Dropdown -------------------------------------------------------------------------
        // - If all selected blocks don't match, show "[various]".
        // - In addition to the above, show list of current values across all fields w/ counts.
        //     - Current values that are NOT in PV list should be disabled from selection.
        // - In addition to the above, show list of PVs w/ counts.
        //
        // ----- Radio Buttons --------------------------------------------------------------------
        // - Show list of current values across all fields w/ counts.
        //     - Current values that are NOT in PV list should be disabled from selection.
        // - In addition to the above, show list of PVs w/ counts.
        //
        // ----- Checkboxes -----------------------------------------------------------------------
        // - Show list of current values across all fields w/ counts.
        //     - Current values that are NOT in PV list should be disabled from selection.
        // - In addition to the above, show list of PVs w/ counts.
        // ========================================================================================

        type FieldOption = {
            // "undefined" indicates there's no associated PV. Ideally, this value should be disabled / not selectable,
            // but that's for the future me to worry about.
            pvId: string | undefined;
            pvName: string;
            displayText: string;
            isSelected: boolean;
        }

        function getTemporalModel(uniqueValues: string[]): DateTime {
            // Determine how many unique dates and unique times there are.
            let setOfDates = new Set<string>();
            let setOfTimes = new Set<string>();
            uniqueValues.forEach(v => {
                if (v !== 'null') {
                    let [d, t] = v.split(' ');
                    d && d !== '' && setOfDates.add(d as string);
                    t && t !== '' && setOfTimes.add(t as string);
                }
            });

            // Create the model object
            let model = { date: '', time: '' };
            if (setOfDates.size === 1) model.date = setOfDates.values().next().value || '';
            if (setOfTimes.size === 1) model.time = setOfTimes.values().next().value || '';

            return model;
        }

        /** Takes a datetime in the format '<date?> <time?>' and makes it more presentable for the dropdown menu. */
        function formatDateTimeForDisplay(dt: string, fieldType: FieldType): string {
            const countString = `[${props.possibleValueCounts!.pvCounts[dt]}/${props.possibleValueCounts!.outOf}]`;
            const [d, t] = dt.split(' ');

            if (fieldType === FieldType.DATE) {
                return `${d || '(no date)'} ${countString}`;
            } else if (fieldType === FieldType.TIME) {
                return `${t || '(no time)'} ${countString}`;
            } else if (fieldType === FieldType.DATETIME) {
                return `${d || '(no date)'} @ ${t || '(no time)'} ${countString}`;
            } else {
                // Shouldn't ever come up ... but to be safe.
                return `(Unrecognized value) ${countString}`;
            }
        }

        // Certain fields, like radio buttons and checkboxes, resolve into multiple elements - one for each "possibleValue".
        let elements: ComputedRef<ElementType[]> = computed(() => {
            let fieldData = props.eicFieldDef as FieldDefinition;

            // -- Field Options --

            let fieldOptions: FieldOption[] = [];

            if (['Dropdown', 'Radio Buttons', 'Checkboxes'].includes(props.eicFieldDef!.type)) {
                // First, add the "[various]" option if the selected fields don't match, but ONLY FOR DROPDOWNS.
                if (props.eicFieldDef!.type === 'Dropdown' && Object.keys(props.possibleValueCounts!.pvCounts).length > 1) {
                    fieldOptions.push({pvId: undefined, pvName: "[various]", displayText: "[various]", isSelected: true});
                }

                // Next, add any selected options that *aren't* in the list of PVs (based on their name)
                let validPvNames = fieldData.possibleValueIds!.map(pvId => possibleValueDefs.value[pvId].name);
                for (let selectedOption of Object.keys(props.possibleValueCounts!.pvCounts)) {
                    if (selectedOption !== 'null' && !validPvNames.includes(selectedOption)) {
                        let isSelected = props.possibleValueCounts!.pvCounts[selectedOption] === props.possibleValueCounts!.outOf;
                        let displayText = selectedOption;
                        if (!isSelected && props.possibleValueCounts!.pvCounts[selectedOption]) displayText += ` [${props.possibleValueCounts!.pvCounts[selectedOption]}/${props.possibleValueCounts!.outOf}]`;
                        fieldOptions.push({pvId: undefined, pvName: selectedOption, displayText, isSelected});
                    }
                }

                // Lastly, add all official PV options
                for (let pvId of fieldData.possibleValueIds!) {
                    let pvName = possibleValueDefs.value[pvId].name;
                    let isSelected = props.possibleValueCounts!.pvCounts[pvName] === props.possibleValueCounts!.outOf;
                    let displayText = pvName;
                    if (!isSelected && props.possibleValueCounts!.pvCounts[pvName]) displayText += ` [${props.possibleValueCounts!.pvCounts[pvName]}/${props.possibleValueCounts!.outOf}]`;
                    fieldOptions.push({pvId: pvId, pvName, displayText, isSelected});
                }
            }

            // -- Elements --

            let e: ElementType[] = [];
            let values = Object.keys(props.possibleValueCounts!.pvCounts);
            switch (fieldData.type) {
                case FieldType.TEXTBOX:
                    e.push({
                        key: fieldData.id + '-textbox',
                        type: componentTypeLookup[FieldType.TEXTBOX],
                        data: { mwDisabled: props.mwDisabled },
                        model: (values.length !== 1) ? '[various]' : (values[0] !== 'null' ? values[0] : '')
                    });
                    break;
                case FieldType.TEXT_EDITOR:
                    e.push({
                        key: fieldData.id + '-markdown',
                        type: componentTypeLookup[FieldType.TEXT_EDITOR],
                        data: { mwDisabled: props.mwDisabled },
                        model: (values.length !== 1) ? '[various]' : (values[0] !== 'null' ? values[0] : '')
                    });
                    break;
                case FieldType.DROPDOWN:
                    let selectedItem = fieldOptions.find(fo => fo.isSelected);
                    e.push({
                        key: fieldData.id + '-dropdown',
                        type: componentTypeLookup[FieldType.DROPDOWN],
                        data: {
                            eicOptions: fieldOptions.map(fieldOption => ({
                                display: fieldOption.displayText,
                                value: fieldOption.pvName
                            })),
                            mwDisabled: props.mwDisabled,
                            mwClearable: true,
                        },
                        model: selectedItem?.pvName
                    });
                    break;
                case FieldType.RADIO_BUTTONS:
                    fieldOptions.forEach((fieldOption, index) => {
                        let selectedItem = fieldOptions.find(fo => fo.isSelected);
                        e.push({
                            key: fieldData.id + '-rb-' + index,
                            type: componentTypeLookup[FieldType.RADIO_BUTTONS],
                            data: { eicLabel: fieldOption.displayText, eicGroup: props.keyPrefix! + fieldData.id, eicRadioValue: fieldOption.pvName, mwDisabled: props.mwDisabled },
                            model: selectedItem?.pvName
                        });
                    });
                    break;
                case FieldType.CHECKBOXES:
                    fieldOptions.forEach((fieldOption) => {
                        e.push({
                            key: fieldOption.pvId || (fieldData.id + '-cb-' + fieldOption.pvName),
                            type: componentTypeLookup[FieldType.CHECKBOXES],
                            data: { eicLabel: fieldOption.displayText, eicUnderlyingValue: fieldOption.pvName, mwDisabled: props.mwDisabled },
                            model: fieldOption.isSelected
                        });
                    });
                    break;
                case FieldType.DATE:
                case FieldType.TIME:
                case FieldType.DATETIME:
                    e.push({
                        key: fieldData.id + '-temporal',
                        type: componentTypeLookup[fieldData.type],
                        data: {
                            mwFieldType: fieldData.type,
                            mwDisabled: props.mwDisabled
                        },
                        model: getTemporalModel(values),
                    });
                    if (values.length > 1) {
                        let dropdownOpts: DropdownOption[] = [{ display: '[various]', value: '[various]', disabled: true }];
                        dropdownOpts.push(...values.map(dt => ({
                            display: formatDateTimeForDisplay(dt, fieldData.type),
                            value: dt
                        })));
                        e.push({
                            key: fieldData.id + '-dropdown',
                            type: componentTypeLookup[FieldType.DROPDOWN],
                            data: {
                                eicOptions: dropdownOpts,
                                mwDisabled: props.mwDisabled
                            },
                            model: '[various]',
                        });
                    }
                    break;
                default:
                    throw new Error("Unrecognized Field Type: " + fieldData.type);
            }

            return e;
        });

        return {
            elements,
            setValue: (newVal: any) => {
                // Temporal fields are a bit funky since they have two different elements that can emit:
                // 1. Datetime element - easy peasy, just emit as-is
                // 2. Dropdown element - gives us a string in the form "<date?> <time?>" that we need to convert to an object.
                let emitValue = newVal;
                if (getFieldDataType((props.eicFieldDef as FieldDefinition).type) === DataType.TEMPORAL && StringUtils.isString(newVal)) {
                    let [date, time] = newVal.split(' ');
                    emitValue = { date, time };
                }
                context.emit('eic-val-set', emitValue);
            }
        }
    }
})
</script>

<style lang="css">

</style>
