<template>
    <div>
        Mind map page
        {{ }}
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';

import { GetBoardDataAction } from '../../actions/board-actions/GetBoardData';
import { useStore } from '../../store/store';

export default defineComponent({
    setup() {
        const store = useStore();

        onMounted(() => {
            let currentBoardId = store.getters.currentProjectBoard?.boardId;
            if (currentBoardId) {
                new GetBoardDataAction(currentBoardId).submit();
            } else {
                // TODO-const : drop a generic error to try again..?
            }
        });
        return {}
    },
});
</script>

<style lang="scss">

@use "../../styles/variables" as vars;

</style>
