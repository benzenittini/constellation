<template>
    <div class="mw-slideopentray" v-bind:class="{ 'disable-pointer-events': pointerEventsDisabled }">
        <!-- There's a vertical stack of icons for each "tab" that can slide open. -->
        <!-- They each have some "hover-open" text, and a "click-open" functionality. -->
        <div class="mw-sot-tab-stack" v-on:mouseleave="highlightedTabId = undefined">
            <div class="mw-sot-tab" v-on:click="clickTab('controls')" v-bind:class="{ active: openedTabId === 'controls' }">
                <eic-svg-question-mark width="25" height="24" v-bind:class="{ active: openedTabId === 'controls' }"></eic-svg-question-mark>
                <span class="mw-sot-tab-preview">Help</span>
            </div>
        </div>

        <div class="mw-sot-tab-content" v-bind:style="{ width: `${contentDimensions.width}px` }">
            <eic-controls-container v-if="openedTabId === 'controls'"></eic-controls-container>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, Ref, ref } from "vue";

import { useStore } from "../store/store";
import { useEmitter } from "../composables/Emitter";

export default defineComponent({
    props: {},
    setup() {
        let openedTabId: Ref<undefined | string> = ref(undefined);
        let highlightedTabId: Ref<undefined | string> = ref(undefined);

        const store = useStore();
        const eventEmitter = useEmitter();

        let contentDimensions = computed(() => {
            if (openedTabId.value === 'controls') {
                return { width: 750 };
            } else {
                return { width: 0 };
            }
        });

        function clickTab(tabId: string) {
            openedTabId.value = (openedTabId.value === tabId) ? undefined : tabId;
        }

        onMounted(() => {
            eventEmitter.register('toggleHelp', 'toggleHelp', () => {
                clickTab('controls');
            });
        });

        onUnmounted(() => {
            eventEmitter.deregister('toggleHelp');
        });

        return {
            openedTabId,
            highlightedTabId,
            contentDimensions,

            pointerEventsDisabled: computed(() => store.getters.pointerEventsDisabled),

            clickTab,
        };
    }
})
</script>

<style>

.mw-slideopentray {

    --tab-size: 41px;
    --border-radius: 10px;

    position: fixed;
    right: 0;
    bottom: 50px;
    z-index: 1000;

    /* Why yes. Yes I am lazy. #mobileFriendly */
    @media (max-width: 675px) { display: none; }

    pointer-events: none;
    .mw-sot-tab-stack,.mw-sot-tab-content {
        display: inline-block;
        pointer-events: auto;
    }
    &.disable-pointer-events {
        .mw-sot-tab-stack,.mw-sot-tab-content {
            pointer-events: none;
        }
    }

    .mw-sot-tab-stack {
        position: relative;
        vertical-align: bottom;
        z-index: 0;
        margin-right: -1px;
        pointer-events: none;

        /* Slide the preview text open when hovered */
        .mw-sot-tab {
            transition: transform 0.4s;
            transform: translateX(calc(100% - var(--tab-size)));
        }
        &:hover {
            .mw-sot-tab { transform: translateX(0); }
        }

        .mw-sot-tab {
            pointer-events: auto;
            min-width: var(--tab-size);
            height: var(--tab-size);
            display: flex;
            align-items: center;

            background: var(--gray-very-dark);
            padding-left: 8px;
            border: 1px solid var(--gray3);
            border-right: none;
            border-radius: var(--border-radius) 0 0 var(--border-radius);
            &.active {
                border-color: var(--gray-very-light);
                .mw-sot-tab-preview { color: var(--gray-very-light); }
            }

            cursor: pointer;

            .mw-sot-tab-preview {
                display: inline-block;
                padding: 0 8px;
                color: var(--gray4);
            }

            &:hover {
                .mw-sot-tab-preview { color: var(--gray-very-light); }
            }
        }
    }

    .mw-sot-tab-content {
        position: relative;
        z-index: 1;
        background: var(--gray-very-dark);
        border: 1px solid var(--gray3);
        border-right: none;
        border-radius: var(--border-radius) 0 0 0;
        vertical-align: bottom;
        right: -1px; /* Prevents a vertical border line along the right edge of the screen. */

        /* Make the widths transition nicely. */
        overflow: hidden;
        transition: width 0.4s;
        /* To avoid an ugly line during a transition when there's no content, let's make this always be as tall as the "tab stack". */
        min-height: 125px;
    }
}

</style>
