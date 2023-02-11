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

export default defineComponent({
    setup() {
        const store = useStore();

        return {
            openBoard: () => {
                // TODO-const : When local board is opened, send actions over IPC
                // TODO-const : When remote board is opened, send actions over WS

                // TODO-const : Set proper values for these
                store.dispatch('setCurrentProjectBoard', { projectId: 'project-id', boardId: 'board-id' });
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
