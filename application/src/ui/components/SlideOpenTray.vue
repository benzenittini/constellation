<template>
    <div class="mw-slideopentray" v-bind:class="{ 'disable-pointer-events': pointerEventsDisabled }">
        <!-- There's a vertical stack of icons for each "tab" that can slide open. -->
        <!-- They each have some "hover-open" text, and a "click-open" functionality. -->
        <div class="mw-sot-tab-stack" v-on:mouseleave="highlightedTabId = undefined">

            <div class="mw-sot-tab" v-if="showControlsTab" v-on:click="clickTab('controls')" v-bind:class="{ active: openedTabId === 'controls' }">
                <eic-svg-question-mark width="25" height="24" v-bind:class="{ active: openedTabId === 'controls' }"></eic-svg-question-mark>
                <span class="mw-sot-tab-preview">Controls</span>
            </div>

            <div class="mw-sot-tab" v-on:click="clickTab('feedback')" v-bind:class="{ active: openedTabId === 'feedback' }">
                <eic-svg-speech-bubble width="25" height="24" v-bind:class="{ active: openedTabId === 'feedback' }"></eic-svg-speech-bubble>
                <span class="mw-sot-tab-preview">Give Feedback</span>
            </div>
        </div>

        <div class="mw-sot-tab-content" v-bind:style="{ width: `${contentDimensions.width}px` }">
            <eic-controls-container v-if="openedTabId === 'controls'"></eic-controls-container>
            <eic-release-note-display
                v-else-if="openedTabId === 'releases'"
                v-bind:mwReleases="parsedReleaseNotes"></eic-release-note-display>
            <!-- Using 'v-show' for the feedback because it registers some event listeners onMounted, so we need it mounted before firing those events. -->
            <eic-give-feedback
                v-show="openedTabId === 'feedback'"
                v-on:close-panel="openedTabId = undefined"></eic-give-feedback>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, Ref, ref, watch } from "vue";

import { useEmitter } from "../composables/Emitter";
import { useGeneralStore } from "../store/GeneralStore";

export default defineComponent({
    props: {},
    setup() {
        let openedTabId: Ref<undefined | string> = ref(undefined);
        let highlightedTabId: Ref<undefined | string> = ref(undefined);

        // TODO-const : find a new way to show the controls tab since we no longer have vue-router.
        // const showControlsTab = computed(() => router.currentRoute.value.path.startsWith("/app"));
        const showControlsTab = computed(() => true);

        let emitter = useEmitter();
        let generalStore = useGeneralStore();

        const parsedReleaseNotes = ref([] as any[]);

        let contentDimensions = computed(() => {
            if      (openedTabId.value === undefined)  return { width: 0   };
            else if (openedTabId.value === 'controls') return { width: 750 };
            else if (openedTabId.value === 'releases') return { width: 500 };
            else if (openedTabId.value === 'feedback') return { width: 300 };
        });

        onMounted(() => {
            emitter.register('sot-give-feedback', 'give-feedback', (content: string) => {
                openedTabId.value = 'feedback';
            });
        });
        onUnmounted(() => {
            emitter.deregister('sot-give-feedback');
        });

        // Auto-close the controls tab if it should no longer be shown (ex: when the user navigates away from the app)
        watch(showControlsTab, (newValue) => {
            if (newValue === false && openedTabId.value === 'controls') {
                openedTabId.value = undefined;
            }
        });

        return {
            openedTabId,
            highlightedTabId,
            showControlsTab,
            parsedReleaseNotes,
            contentDimensions,

            pointerEventsDisabled: generalStore.pointerEventsDisabled(),

            clickTab: (tabId: string) => {
                openedTabId.value = (openedTabId.value === tabId) ? undefined : tabId;
            },
        };
    }
})
</script>

<style lang="scss">
@use "../styles/variables" as vars;
@use "../styles/animations";

.mw-slideopentray {

    $tab-size: 41px;
    $border-radius: 10px;

    position: fixed;
    right: 0;
    bottom: 50px;
    z-index: 1000;

    // Why yes. Yes I am lazy. #mobileFriendly
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
        pointer-events: none;

        // Slide the preview text open when hovered
        .mw-sot-tab {
            transition: transform 0.4s;
            transform: translateX(calc(100% - #{$tab-size}));
        }
        &:hover {
            .mw-sot-tab { transform: translateX(0); }
        }

        .mw-sot-tab {
            pointer-events: auto;
            min-width: $tab-size;
            height: $tab-size;

            background: vars.$gray-very-dark;
            padding: 8px;
            border: 1px solid vars.$gray3;
            border-right: none;
            border-radius: $border-radius 0 0 $border-radius;
            &.active {
                border-color: vars.$gray-very-light;
                .mw-sot-tab-preview { color: vars.$gray-very-light; }
            }
            // Show the preview text when needed (ex: when there's new release notes.)
            &.displayed {
                transform: translateX(0);
                animation: ripple 1.5s linear 3;
            }

            cursor: pointer;

            .mw-sot-tab-preview {
                display: inline-block;
                padding: 5px 8px;
                vertical-align: top;
                color: vars.$gray4;
            }

            &:hover {
                .mw-sot-tab-preview { color: vars.$gray-very-light; }
            }

            .mw-sot-new-notes {
                color: vars.$cyan;
                font-weight: bold;
            }
        }
    }

    .mw-sot-tab-content {
        position: relative;
        z-index: 1;
        background: vars.$gray-very-dark;
        border: 1px solid vars.$gray3;
        border-right: none;
        border-radius: $border-radius 0 0 0;
        vertical-align: bottom;
        right: -1px; // Prevents a vertical border line along the right edge of the screen.

        // Make the widths transition nicely.
        overflow: hidden;
        transition: width 0.4s;
        // To avoid an ugly line during a transition when there's no content, let's make this always be as tall as the "tab stack".
        min-height: 125px;
    }
}

</style>
