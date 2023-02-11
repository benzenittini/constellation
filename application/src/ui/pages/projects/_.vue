<template>
    <div id="mw-projects">
        Projects page!
        <div class="mw-board"
            v-on:click="openBoard()"
            >Open Board</div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';

import { useStore } from '../../store/store';
import { LOCAL_PROJECT } from '../../store/Types/GeneralDataTypes';

export default defineComponent({
    setup() {
        const store = useStore();

        return {
            openBoard: () => {
                // TODO-const : Set proper values for these
                store.dispatch('setCurrentProjectBoard', { projectId: LOCAL_PROJECT, boardId: 'board-id' });
            }
        }
    },
});
</script>

<style lang="scss">

@use "../../styles/variables" as vars;

#mw-projects {
    .mw-board {
        width: 200px;
        height: 200px;
        background: vars.$gray1;
    }
}

</style>
