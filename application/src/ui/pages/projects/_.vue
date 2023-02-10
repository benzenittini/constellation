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

import { BoardCommsSingleton } from '../../communications/BoardCommsSingleton';
import { useGeneralStore } from '../../store/GeneralStore';

export default defineComponent({
    setup() {
        const generalStore = useGeneralStore();

        return {
            openBoard: () => {
                // TODO-const : When local board is opened:
                BoardCommsSingleton.activateLocalInterface();
                // TODO-const : When remote board is opened:
                // BoardCommsSingleton.activateRemoteInterface();

                generalStore.setCurrentProjectBoard('project-id', 'board-id')
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
