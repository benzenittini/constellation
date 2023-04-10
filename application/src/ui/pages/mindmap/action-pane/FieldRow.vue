<template>
    <div class="mw-app-actionpane-fieldrow">
        <div class="eic-cell eic-name-col"
            v-bind:class="{ 'when-tree-is-displayed': showTree }">
            <svg class="mw-tree" v-if="showTree" viewBox="0 0 100 130">
                <line x1="50%" y1="0%" x2="50%" y2="100%"></line> <!-- Vertical -->
                <line x1="50%" y1="50%" x2="90%" y2="50%"></line> <!-- Horizontal -->
            </svg>
            <eic-textbox v-model="fieldDef.name" eic-placeholder="Field Name"></eic-textbox>
        </div>
        <div class="eic-cell eic-type-col">
            <eic-dropdown v-bind:eic-options="typeOptions" v-model="fieldDef.type"></eic-dropdown>
        </div>
        <div class="eic-cell eic-pv-col">
            <eic-possiblevaluedisplay
                v-if="fieldTypeHasPVs(fieldDef.type)"
                v-bind:eicPossibleValueDefs="fieldDef.possibleValueIds.map(pvId => possibleValueDefs[pvId])"
                eicPlaceholder="(click to edit)"
                v-bind:class="{ 'is-focused': isFocused }"
                v-on:click="$emit('mw-toggle-possible-value-pane', fieldDef.id)"
                ></eic-possiblevaluedisplay>
            <span v-else class="eic-pv-notapplicable">N/A</span>
        </div>
        <div class="eic-cell eic-delete-col">
            <eic-svg-deletion-x
                v-on:mouseover="$emit('mw-hovered-for-deletion', {isHovered: true})"
                v-on:mouseleave="$emit('mw-hovered-for-deletion', {isHovered: false})"
                v-bind:style="{ opacity: isHovered ? 1 : 0 }"
                v-on:click="$emit('mw-delete-field', fieldDef.id)"></eic-svg-deletion-x>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { fieldTypeHasPVs, getAllFieldTypes, getCompatibleFieldTypes, getFieldDataType } from "constellation-common";


export default defineComponent({
    props: {
        possibleValueDefs: Object,
        fieldDef: Object,
        isFocused: Boolean,
        isHovered: Boolean,
        isExistingField: Boolean,
        showTree: Boolean, // Whether or not to show the SVG "tree" to the left of the field names
    },
    setup(props) {
        let compatibleFieldTypes = props.isExistingField
            ? getCompatibleFieldTypes(props.fieldDef!.type)
            : getAllFieldTypes();

        return {
            fieldTypeHasPVs,
            typeOptions: getAllFieldTypes().map(ft => ({
                value: ft,
                group: getFieldDataType(ft),
                disabled: !compatibleFieldTypes.includes(ft),
            })),
        }
    }
})
</script>

<style lang="scss">
@use "dialogs";

</style>
