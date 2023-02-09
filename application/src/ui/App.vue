<template>
    <div class="mw-app">
        Hello, from Vue!
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

export default defineComponent({
    setup() {
        return {};
    },
});
</script>

<style lang="scss">

$textcolor: blue;
.mw-app {
    color: $textcolor;
}

</style>
