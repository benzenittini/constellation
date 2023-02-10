<template>
    <div>
        App page
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';

import { GetBoardDataAction } from '../../actions/board-actions/GetBoardData';

export default defineComponent({
    setup() {
        onMounted(() => {
            // TODO-const : replace with proper IDs
            new GetBoardDataAction('board-id').submit();
        });
        return {}
    },
});
</script>

<style lang="scss">

@use "../../styles/variables" as vars;

</style>
