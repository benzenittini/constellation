<template>
    <div class="eic-form-component mw-mappablelabel">
        {{ displayedValue }}
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

export default defineComponent({
    props: {
        modelValue: [Array, Object], // Must be "modelValue" for v-model to work
        mapFunction: Function,
    },
    setup(props, context) {
        let inputVal = computed({
            get: () => props.modelValue,
            set: (val: any) => { context.emit('update:modelValue', val)}
        });

        let displayedValue = computed(() => {
            if (props.mapFunction) {
                return props.mapFunction(inputVal.value);
            } else {
                return inputVal
            }
        });

        return {
            displayedValue
        }
    },
    methods: {
    }
})
</script>

<style lang="css">
.mw-mappablelabel {
    color: var(--gray-very-light);
}
</style>
