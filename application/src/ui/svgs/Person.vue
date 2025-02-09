<template>
    <svg class="mw-svg-person" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect x="0" y="0" width="34" height="34" stroke="transparent" fill="transparent" />

        <!-- The rest of the icon (https://i.imgur.com/rCr9A.png) -->
        <circle class="backdrop" cx="17" cy="17" r="17" />
        <mask id="mask0_1081_3839" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="34" height="34">
            <circle cx="17" cy="17" r="17" fill="#8ADCFF"/>
        </mask>
        <g mask="url(#mask0_1081_3839)">
            <circle class="body" cx="17" cy="10" r="8.5" />
            <mask id="path-4-inside-1_1081_3839" fill="white">
                <path d="M33 36C33 33.6362 32.5861 31.2956 31.7821 29.1117C30.978 26.9278 29.7994 24.9435 28.3137 23.2721C26.828 21.6006 25.0641 20.2748 23.1229 19.3702C21.1817 18.4656 19.1011 18 17 18C14.8988 18 12.8183 18.4656 10.8771 19.3702C8.93585 20.2748 7.17203 21.6006 5.68629 23.2721C4.20055 24.9435 3.022 26.9278 2.21793 29.1117C1.41385 31.2956 1 33.6362 1 36L17 36H33Z"/>
            </mask>
            <path class="body" d="M33 36C33 33.6362 32.5861 31.2956 31.7821 29.1117C30.978 26.9278 29.7994 24.9435 28.3137 23.2721C26.828 21.6006 25.0641 20.2748 23.1229 19.3702C21.1817 18.4656 19.1011 18 17 18C14.8988 18 12.8183 18.4656 10.8771 19.3702C8.93585 20.2748 7.17203 21.6006 5.68629 23.2721C4.20055 24.9435 3.022 26.9278 2.21793 29.1117C1.41385 31.2956 1 33.6362 1 36L17 36H33Z" stroke-width="2" mask="url(#path-4-inside-1_1081_3839)"/>
        </g>
        <circle class="outline" cx="17" cy="17" r="16.5" />

    </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    setup() {
        return {}
    },
})
</script>

<style lang="css">

.mw-svg-person {

    .outline  { stroke: var(--cyan); }
    .backdrop { fill: var(--cyan); }
    .body     { fill: var(--gray-very-dark); }

}

</style>