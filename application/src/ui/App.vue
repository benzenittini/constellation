<template>
    <div class="mw-app">
        <mw-vm-modal-group v-bind:class="{ 'disable-pointer-events': pointerEventsDisabled }"></mw-vm-modal-group>
        <mw-vn-notification-display></mw-vn-notification-display>

        <main>
            <eic-page-mindmap v-if="hasBoardOpen"></eic-page-mindmap>
            <eic-page-projects v-else></eic-page-projects>
        </main>

        <!-- TODO-const : Re-enable slide-open-tray on app page..? -->
        <!-- <eic-slide-open-tray></eic-slide-open-tray> -->
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';

import { useStore } from './store/store';

export default defineComponent({
    setup() {
        const store = useStore();

        return {
            pointerEventsDisabled: computed(() => store.getters.pointerEventsDisabled),
            hasBoardOpen: computed(() => store.state.generalData.currentProjectBoard?.boardId),
        }
    },
});
</script>

<style lang="scss">

@use "./styles/variables" as vars;
@use "./styles/mixins";

.mw-app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;

    .mw-vm-modal-group.disable-pointer-events {
        .mw-vm-modal {
            pointer-events: none;
        }
    }
    .mw-vm-modal-group {
        .mw-vm-main {
            @include mixins.scrollbars;
        }
    }

    main {
        flex-grow: 1;
        background: vars.$gray-dark;
        z-index: 0;

        display: flex;
        align-items: stretch; // Children stretch to fill height of main
        justify-content: center; // Children are horizontally centered inside main
    }
}

</style>
