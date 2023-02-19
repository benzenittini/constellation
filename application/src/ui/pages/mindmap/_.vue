<template>
    <div class="mw-app-relationship" >
        <!-- TODO-const : remove selectedblocks and ids from parameters..? -->
        <!-- <eic-app-configpane
            v-bind:mw-selected-blocks="selectedBlocks"
            v-bind:mw-selected-block-ids="selectedBlockIds"
            v-bind:mw-show-alignment-controls="true"
            v-bind:mw-show-after-number-selected="2"
            ></eic-app-configpane> -->
        <eic-canvas></eic-canvas>
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
                new GetBoardDataAction().submit();
            } else {
                // TODO-const : drop a generic error to try again..?
            }
        });
        return {}
    },
});
</script>

<style lang="scss">
.mw-app-relationship {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
}
</style>
