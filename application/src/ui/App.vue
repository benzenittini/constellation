<template>
    <div class="mw-app">
        <mw-vm-modal-group v-bind:class="{ 'disable-pointer-events': pointerEventsDisabled }"></mw-vm-modal-group>
        <mw-vn-notification-display></mw-vn-notification-display>

        Hello, from Vue!

        <main>
            <router-view></router-view>
        </main>

        <eic-slide-open-tray></eic-slide-open-tray>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';

import { useGeneralStore } from './store/GeneralStore';

export default defineComponent({
    setup() {
        const generalStore = useGeneralStore();

        return {
            pointerEventsDisabled: generalStore.pointerEventsDisabled(),
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
        border-radius: vars.$radius-xlarge;

        display: flex;
        align-items: stretch; // Children stretch to fill height of main
        justify-content: center; // Children are horizontally centered inside main
    }
}

</style>
