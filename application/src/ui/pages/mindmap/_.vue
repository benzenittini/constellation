<template>
    <div class="mw-app-relationship">

        <eic-titlebar></eic-titlebar>

        <div class="mw-app-content">
            <!-- TODO-const : this is where the view-container should go, possibly nesting actionpane and canvas inside their own div. -->
            <!-- <eic-view-container
                v-on:viewOpened="showHideMindMap(false)"
                v-on:viewClosed="showHideMindMap(true)"
                ></eic-view-container> -->
            <eic-action-pane
                v-bind:mw-show-alignment-controls="true"
                v-bind:mw-show-after-number-selected="2"
                v-bind:mw-selected-blocks="selectedBlocks"
                v-bind:mw-selected-block-ids="selectedBlockIds"
                ></eic-action-pane>
            <eic-canvas></eic-canvas>
        </div>
    </div>
</template>


<script lang="ts">
import { defineComponent, computed, onMounted, onUnmounted } from 'vue';

import { GetBoardDataAction } from '../../actions/board-actions/GetBoardData';
import { useEmitter } from '../../composables/Emitter';
import { useWindowEvents } from '../../composables/WindowEvents';
import { useStore } from '../../store/store';

export default defineComponent({
    setup() {
        const store = useStore();
        const windowEvents = useWindowEvents();
        const eventEmitter = useEmitter(); // Emits/receives events from other components

        let selectedBlocks   = computed(() => store.getters.selectedBlocks);
        let selectedBlockIds = computed(() => store.getters.selectedBlockIds);

        function setTabName(projectName: string | undefined, boardName: string | undefined) {
            let newTitle = '';
            if (projectName) newTitle += projectName + ' - ';
            if (boardName)   newTitle += boardName;
            document.title = newTitle;
        }

        onMounted(() => {
            let projectBoard = store.getters.currentProjectBoard;
            if (projectBoard?.boardId) {
                let currentProject = store.state.generalData.projectData[projectBoard.projectId]
                setTabName(currentProject?.projectName, currentProject?.boards[projectBoard.boardId].boardName);
                new GetBoardDataAction().submit();

                // Register some global event handlers
                windowEvents.register('globalAppKeyDown', 'keydown', (keyboardEvent: KeyboardEvent) => {
                    if (keyboardEvent.key === "/") {
                        eventEmitter.emit('focusSearch');
                        keyboardEvent.preventDefault();
                    } else if (keyboardEvent.key === "Down" || keyboardEvent.key === "ArrowDown") {
                        // IE/Edge uses "Down". Others use "ArrowDown".
                        eventEmitter.emit('nextSearchResult');
                    } else if (keyboardEvent.key === "Up" || keyboardEvent.key === "ArrowUp") {
                        // IE/Edge uses "Up". Others use "ArrowUp".
                        eventEmitter.emit('previousSearchResult');
                    } else if (!keyboardEvent.ctrlKey && !keyboardEvent.metaKey && !keyboardEvent.altKey && keyboardEvent.key === " ") {
                        store.dispatch("lockOpenClosed", { blockIds: store.getters.selectedBlockIds });
                    }
                });
            } else {
                // TODO-const : drop a generic error to try again..?
            }
        });

        onUnmounted(() => {
            windowEvents.deregisterAll();
        });

        return {
            selectedBlocks,
            selectedBlockIds,
        }
    },
});
</script>

<style lang="scss">
.mw-app-relationship {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .mw-app-content {
        position: relative;
        flex-grow: 1;
    }
}
</style>
