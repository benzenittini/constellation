<template>
    <div class="mw-app-actionpane-recentcolorpicker">
        <div class="mw-dialog-section" v-if="boardColors.length > 0">
            <h3>Board Colors</h3>
            <div v-for="color in boardColors" v-bind:key="color"
                class="color-swatch"
                v-bind:style="{ 'background': color }"
                v-on:click="$emit('mw-color-picked', color)"
                ></div>
        </div>
        <div class="mw-dialog-section" v-if="projectColors.length > 0">
            <h3>Project Colors</h3>
            <div v-for="color in projectColors" v-bind:key="color"
                class="color-swatch"
                v-bind:style="{ 'background': color }"
                v-on:click="$emit('mw-color-picked', color)"
                ></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        projectColors: Array,
        boardColors: Array,
    },
    setup(props) {
        return {
        }
    }
})
</script>

<style lang="scss">

@use "../../../styles/variables" as vars;

.mw-app-actionpane-recentcolorpicker {
    .mw-dialog-section {
        background: vars.$gray-very-dark;
        border-radius: vars.$dialog-section-radius;
        padding: 10px 10px;
        &:not(:last-child) { margin-bottom: vars.$dialog-section-gap; }

        h3 { margin: 0; padding: 0; }
        color: vars.$gray4;

        .color-swatch {
            cursor: pointer;
            display: inline-block;
            width: 30px;
            height: 30px;
            margin: 10px 5px 0 5px;
            border: 1px solid vars.$gray3;
        }
    }
}

</style>
