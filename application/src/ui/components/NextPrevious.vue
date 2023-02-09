<template>
    <div class="mw-nextprevious">
        <span v-on:click="$emit('mw-previous', $event)">{{ mwPreviousText }}</span>
        <button class="primary pink"
            v-on:click="$emit('mw-next', $event)"
            v-bind:disabled="mwNextDisabledMessage"
            v-bind:title="mwNextDisabledMessage"
            >{{ mwNextText }}</button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        mwPreviousText: {
            type: String,
            default: '<< Previous'
        },
        mwNextText: {
            type: String,
            default: 'Next'
        },
        mwNextDisabledMessage: {
            type: String,
            default: undefined
        },
    },
    setup() {
        return {}
    }
})
</script>

<style lang="scss">
@use "../styles/variables" as vars;

.mw-nextprevious {
    padding: 5px 35px;

    text-align: right;
    span {
        cursor: pointer;
        margin-right: 10px;

        color: vars.$gray4;
        &:hover { color: vars.$gray-very-light; }
    }
}

</style>