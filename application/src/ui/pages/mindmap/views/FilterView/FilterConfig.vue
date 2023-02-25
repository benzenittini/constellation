<template>
    <div class="mw-app-filter-config">
        <!-- No filter config! :) -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        mwView: Object,
    },
    setup() {
        return {};
    }
})
</script>

<style lang="scss">
@use "../../../../styles/variables" as vars;
@use "../../viewstyles";

.mw-app-filter-config {
}

</style>
