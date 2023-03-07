<template>
    <div class="mw-app-relationship">

        <eic-titlebar></eic-titlebar>

        <div class="mw-app-content">
            <eic-view-container
                v-on:viewOpened="showHideMindMap(false)"
                v-on:viewClosed="showHideMindMap(true)"
                ></eic-view-container>

            <div class="mw-mind-map" v-show="showMindMap">
                <eic-action-pane
                    v-bind:mw-show-alignment-controls="true"
                    v-bind:mw-show-after-number-selected="2"
                    v-bind:mw-selected-blocks="selectedBlocks"
                    v-bind:mw-selected-block-ids="selectedBlockIds"
                    ></eic-action-pane>
                <eic-canvas></eic-canvas>
            </div>
        </div>

        <eic-slide-open-tray></eic-slide-open-tray>
    </div>
</template>


<script lang="ts">
import { defineComponent, computed, onMounted, onUnmounted, ref } from 'vue';
import { LOCAL_PROJECT } from '../../../../../common/DataTypes/BoardDataTypes';

import { GetBoardDataAction } from '../../actions/board-actions/GetBoardData';
import { useEmitter } from '../../composables/Emitter';
import { useWindowEvents } from '../../composables/WindowEvents';
import { useStore } from '../../store/store';
import { ws } from '../../communications/Websocket';

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

                // If it's a local project, request the data.
                if (projectBoard.projectId === LOCAL_PROJECT) {
                    new GetBoardDataAction().submit();
                } else {
                    // If it's a remote project, set up the websocket connection
                    let remoteProject = store.getters.getRemoteProjectById(projectBoard.projectId);
                    if (!remoteProject) {
                        // TODO-const : drop a generic error to try again..?
                        console.error("Could not find remote project.");
                    } else {
                        ws.connectWebsocket(remoteProject, projectBoard.boardId);
                    }
                }
            } else {
                // TODO-const : drop a generic error to try again..?
            }
        });

        onUnmounted(() => {
            windowEvents.deregisterAll();
            ws.disconnectWebsocket();
            ws.closeOutdatedNotification();
        });

        let showMindMap = ref(true);

        return {
            selectedBlocks,
            selectedBlockIds,
            showMindMap,
            showHideMindMap: (show: boolean) => {
                if (show) {
                    showMindMap.value = true;
                } else {
                    setTimeout(() => showMindMap.value = false, 400);
                }
            }
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

        .mw-mind-map {
            height: 100%;
        }
    }
}
</style>
