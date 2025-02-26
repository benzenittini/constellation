<template>
    <div class="mw-app-titlebar">
        <div class="view-icons">
            <eic-view-selector mw-view-type="filter" :mw-is-available="true" title="Filters"></eic-view-selector>
            <eic-view-selector mw-view-type="kanban" :mw-is-available="true" title="Kanban Boards"></eic-view-selector>
        </div>

        <eic-search class="app-search"></eic-search>

        <div class="mw-right-side">
            <span v-if="activeViewConfig !== undefined" class="go-back" v-on:click="closeView()">
                <eic-svg-arrow-2 width="30" height="30"></eic-svg-arrow-2>
                <span>Close View</span>
            </span>
            <span v-else class="go-back" v-on:click="backToProjects()">
                <eic-svg-arrow-2 width="30" height="30"></eic-svg-arrow-2>
                <span>Board Selection</span>
            </span>
            <svg v-if="isLocal" class="save-indicator" width="15" height="15">
                <title>{{ isSaved ? 'Saved!' : 'Saving...' }}</title>
                <circle v-bind:class="{ saving: !isSaved, saved: isSaved }"
                    r="5" cx="7" cy="7" />
            </svg>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, ref } from "vue";

import { useStore } from "../../../store/store";
import { useEmitter } from "../../../composables/Emitter";
import { ws } from '../../../communications/Websocket';

export default defineComponent({
    props: {},
    setup() {
        const store = useStore();
        const emitter = useEmitter();

        let isLocal = !store.getters.isCurrentBoardRemote;

        let isSaved = ref(true);
        let activeViewConfig = computed(() => store.state.viewData.activeViewConfig);

        onMounted(() => {
            (window as any).board.updateSaveStatus((_event: any, newStatus: boolean) => {
                isSaved.value = newStatus;
            });
        });
        onUnmounted(() => {
            (window as any).board.clearSaveListeners();
        });

        return {
            isLocal,
            isSaved,
            activeViewConfig,
            backToProjects: () => {
                store.dispatch('clearBoardState');
            },
            closeView: () => {
                emitter.emit('closeView', activeViewConfig.value?.id);
            },
        }
    }
})
</script>

<style>

.mw-app-titlebar {
    display: flex;
    align-items: center;
    z-index: 10;

    background: var(--gray-very-dark);
    padding: 10px;

    &>* {
        flex: 0 0 250px;
        margin-left: 50px;
        margin-right: 50px;
    }
    .view-icons>* {
        margin: 0 10px;
    }
    .app-search { flex-grow: 1; }

    .mw-right-side {
        text-align: right;
        .save-indicator {
            vertical-align: middle;
            margin: 0 -20px 0 20px;
            circle {
                &.saving { fill: var(--yellow2); }
                &.saved  { fill: var(--green1); }
                stroke: transparent;
            }
        }
        .go-back {
            cursor: pointer;
            span {
                vertical-align: middle;
                margin-left: 5px;
                color: var(--gray3);
            }
            .mw-svg-arrow2 {
                transform: scaleX(-1);
                transform-origin: center;
                transition: transform 0.4s;
                stroke: var(--gray3);
            }
            &:hover {
                span { color: var(--gray-very-light); }
                .mw-svg-arrow2 { stroke: var(--gray-very-light); transform: translateX(-10px) scaleX(-1); }
            }
        }
    }
}

</style>
