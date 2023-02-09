<template>
    <div class="mw-infodisplay" v-on:mouseenter="showExpansion" v-on:mouseleave="hideExpansion">
        <div class="the-i">i</div>

        <div v-bind:class="{expansion: true, 'show-expansion': menuExpanded}">
            <div v-show="menuExpanded || notHidden" v-html="eicText"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
    props: {
        eicText: String
    },
    setup() {
        let menuExpanded = ref(false);
        let notHidden = ref(false);

        return {
            menuExpanded, notHidden,

            showExpansion: () => {
                menuExpanded.value = true;
                // By putting this one in a timeout, we avoid the case where the user stops hovering, then
                // immediately starts to re-hover prior to the 200ms timeout from below, causing the next
                // mouseleave event to immediately hide the expanded view.
                setTimeout(() => { notHidden.value = true; }, 200);
            },
            hideExpansion: () => {
                menuExpanded.value = false;
                // We want to set Vue's "show" directive to 200ms after the user stopped hovering to give the
                // opacity a chance to transition to "0". Avoids an abrupt disappearances.
                setTimeout(() => { notHidden.value = false; }, 200);
            }
        }
    }
})
</script>

<style lang="scss">

@use "sass:math";
@use "../styles/variables" as vars;

.mw-infodisplay {
    position: absolute; 
    z-index: 10;

    $circle-size: 25px;
    .the-i {
        position: absolute;
        z-index: 10;

        color: vars.$cyan;
        font-weight: bold;
        font-size: 1.2em;
        font-family: "DejaVu Serif";
        text-align: center;

        background: vars.$gray-very-dark;
        border: 2px solid vars.$cyan;
        border-radius: math.div($circle-size, 2);
        height: $circle-size;
        width: $circle-size;

        cursor: default;
    }

    .expansion {
        // Makes the single-line expansion appear centered better around the "i"
        transform: translate(-2px, -2px);

        z-index: 9;
        transition: opacity 0.3s;
        opacity: 0;
        position: relative;

        div {
            color: vars.$gray-very-dark;
            font-size: 1.2em;

            border-radius: math.div($circle-size, 2);
            background: vars.$cyan;
            padding: 5px 10px;
            padding-left: $circle-size + 5px;
        }
    }
    .show-expansion {
        opacity: 1;
    }
}
</style>