<template>
    <svg class="mw-svg-gear" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect x="0" y="0" width="16" height="16" fill="transparent" stroke="none"/>

        <!-- These make up the actual icon -->
        <path fill-rule="evenodd" clip-rule="evenodd" d="M8.00004 14.5455C11.615 14.5455 14.5455 11.615 14.5455 8C14.5455 4.38504 11.615 1.45454 8.00004 1.45454C4.38509 1.45454 1.45459 4.38504 1.45459 8C1.45459 11.615 4.38509 14.5455 8.00004 14.5455ZM8.00004 12.7273C10.6108 12.7273 12.7273 10.6108 12.7273 8C12.7273 5.3892 10.6108 3.27273 8.00004 3.27273C5.38924 3.27273 3.27277 5.3892 3.27277 8C3.27277 10.6108 5.38924 12.7273 8.00004 12.7273Z"/>
        <rect y="6.54546" width="2.18182" height="2.90909" rx="1"/>
        <rect x="3.33093" y="1.27273" width="2.18182" height="2.90909" rx="1" transform="rotate(45 3.33093 1.27273)"/>
        <rect x="13.149" y="11.0909" width="2.18182" height="2.90909" rx="1" transform="rotate(45 13.149 11.0909)"/>
        <rect x="13.8181" y="6.54546" width="2.18182" height="2.90909" rx="1"/>
        <rect x="6.54541" y="16" width="2.18182" height="2.90909" rx="1" transform="rotate(-90 6.54541 16)"/>
        <rect x="1.27271" y="12.6327" width="2.18182" height="2.90909" rx="1" transform="rotate(-45 1.27271 12.6327)"/>
        <rect x="11.0909" y="2.81454" width="2.18182" height="2.90909" rx="1" transform="rotate(-45 11.0909 2.81454)"/>
        <rect x="6.54541" y="2.18182" width="2.18182" height="2.90909" rx="1" transform="rotate(-90 6.54541 2.18182)"/>
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

<style>

.mw-svg-gear {
    fill: var(--gray3);
}

</style>