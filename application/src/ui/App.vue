<template>
    <div class="mw-app">
        <mw-vm-modal-group v-bind:class="{ 'disable-pointer-events': pointerEventsDisabled }"></mw-vm-modal-group>
        <mw-vn-notification-display></mw-vn-notification-display>

        <main>
            <eic-page-mindmap v-if="hasBoardOpen"></eic-page-mindmap>
            <eic-page-projects v-else></eic-page-projects>
        </main>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';

import { useStore } from './store/store';
import { GetUserSettingsAction } from './actions/project-actions/GetUserSettings';

export default defineComponent({
    setup() {
        const store = useStore();

        onMounted(() => {
            new GetUserSettingsAction().submit();
        });

        return {
            pointerEventsDisabled: computed(() => store.getters.pointerEventsDisabled),
            hasBoardOpen: computed(() => store.state.generalData.currentProjectBoard?.boardId),
        }
    },
});
</script>

<style>

.mw-app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;

    .mw-vm-modal-group.disable-pointer-events {
        .mw-vm-modal {
            pointer-events: none;
        }
    }

    main {
        flex-grow: 1;
        background: var(--gray-dark);
        z-index: 0;

        display: flex;
        align-items: stretch; /* Children stretch to fill height of main */
        justify-content: center; /* Children are horizontally centered inside main */
    }
}

</style>
