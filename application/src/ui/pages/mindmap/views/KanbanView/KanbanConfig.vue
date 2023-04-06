<template>
    <div class="mw-app-kanban-config">
        <h3 class="mwe-config-heading mwm-inline">Create Columns From</h3>
        <div v-if="classificationFieldPairOptions.length === 0" class="mwe-kanban-no-ss-fields">
            No "single-select" fields found. Consider adding some dropdown or radio button fields to use this feature.
        </div>
        <eic-dropdown v-else
            class="mwe-kanban-grouping-field"
            v-bind:eic-options="classificationFieldPairOptions"
            v-model="mwView.groupingFieldId"
            ></eic-dropdown>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { useStore } from "../../../../store/store";
import { DataType, getFieldDataType } from "../../../../../../../common/DataTypes/FieldDataTypes";

export default defineComponent({
    props: {
        mwView: Object,
    },
    setup() {
        const store = useStore();

        const classificationFieldPairOptions = store.getters.classificationFieldPairOptions((field) => {
            return getFieldDataType(field.type) === DataType.SINGLE_SELECT;
        });

        return {
            classificationFieldPairOptions,
        };
    }
})
</script>

<style lang="scss">
@use "../../../../styles/variables" as vars;
@use "../../viewstyles";

.mw-app-kanban-config {
    .mwe-kanban-no-ss-fields {
        display: inline-block;
        color: vars.$red-error;
        max-width: 50%;
        vertical-align: top;
    }
    .mwe-kanban-grouping-field {
        display: inline-block;
    }
}

</style>
