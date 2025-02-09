<template>
    <div class="mw-app-viewcontainer" v-bind:class="{ 'is-open': showView }">
        <template v-if="currentView">
            <!-- View Contents -->
            <component v-bind:is="`eic-${currentView.type.toLowerCase()}-contents`"
                class="mwe-view-contents-section"
                v-on:mw-close-view="closeView()"></component>

            <!-- View Configuration -->
            <div class="mwe-view-config-wrapper" v-bind:class="{ 'is-visible': showConfiguration }">
                <div class="mwe-view-config-section">
                    <!-- Navigation Tabs -->
                    <div class="mwe-config-tabs">
                        <div class="mwe-config-tab"
                            v-on:click="closeView()">
                            Back to Mind Map
                        </div>
                        <div class="mwe-config-tab"
                            v-on:click="showConfiguration = !showConfiguration">
                            <span>Configuration</span>
                            <eic-svg-doublearrow height="13" v-bind:class="{ 'is-rotated': !showConfiguration }"></eic-svg-doublearrow>
                        </div>
                    </div>

                    <div class="mwe-view-config">
                        <!-- Left-Side Config -->
                        <div class="mwe-config-content">
                            <div>
                                <h3 class="mwe-config-heading mwm-inline">View Name</h3>
                                <eic-textbox ref="viewNameRef" v-model="currentView.name"></eic-textbox>
                            </div>

                            <!-- View-specific config -->
                            <component v-bind:is="`eic-${currentView.type.toLowerCase()}-config`" v-bind:mwView="currentView"></component>

                            <div>
                                <h3 class="mwe-config-heading">Include blocks which...</h3>
                                <eic-filter-chain-config v-bind:mwFilterChain="currentView.filter"></eic-filter-chain-config>
                            </div>
                        </div>

                        <div class="mwe-view-save-button-wrapper">
                            <div class="mwe-view-save-buttons">
                                <button class="red tertiary"  v-if="!isNewView" v-on:click="deleteView()">Delete view</button>
                                <button class="pink tertiary" v-if="!isNewView" v-on:click="saveAsNewView()">Save as new view</button>
                                <button class="pink primary"  v-on:click="saveView()">{{ isNewView ? 'Save view' : 'Save (overwrite existing)' }}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, onUnmounted, Ref, ref, watch } from "vue";
import { v4 as uuidv4 } from 'uuid';

import { useStore } from "../../../store/store";
import { useEmitter } from "../../../composables/Emitter";
import { ViewConfig } from 'constellation-common/datatypes';
import { ObjectUtils } from 'constellation-common/utilities';
import { isValidConfig } from "../../../store/Types/ViewStoreTypes";

import { SaveViewAction } from '../../../actions/board-actions/SaveView';
import { DeleteViewAction } from '../../../actions/board-actions/DeleteView';

export default defineComponent({
    emits: ['viewClosed', 'viewOpened'],
    props: {
    },
    setup(props, context) {
        const store   = useStore();
        const emitter = useEmitter();

        let currentView = computed(() => store.state.viewData.activeViewConfig);
        let showConfiguration = ref(false);
        let showView = ref(false);

        function tidyAfterClose() {
            showView.value = false;
            showConfiguration.value = false;
            context.emit('viewClosed');
        }

        watch(currentView, (newVal) => {
            if (newVal) {
                context.emit('viewOpened');
            } else {
                // If this view was deleted by another user, then make sure we properly tidy up this component.
                tidyAfterClose();
            }
        });

        let viewNameRef: Ref<null | HTMLElement> = ref(null);

        let isNewView = ref(false);

        let originalViewConfig: ViewConfig | null = null;

        function removeConfigsForComparison(viewConfig: any) {
            if ("id" in viewConfig)              delete viewConfig.id;
            if ("type" in viewConfig)            delete viewConfig.type;
            return viewConfig;
        }

        function saveCheck() {
            if (!currentView.value) return;

            if (!ObjectUtils.areEqual(originalViewConfig, removeConfigsForComparison(JSON.parse(JSON.stringify(currentView.value))))) {
                // TODO-later : check if config changed since last save, and warn user.
                // This check doesn't work (passing too often), but even if it did ... there's no way to pull the e-brake and cancel unloading the new view.
            }
        }

        function closeView() {
            saveCheck();
            tidyAfterClose();
            setTimeout(() => store.dispatch('closeView'), 500); // Long enough for the "close" transition to complete.
        }

        onMounted(() => {
            watch(currentView, () => {
                if (currentView.value !== undefined) {
                    showView.value = true;

                    if (originalViewConfig) {
                        saveCheck();
                    }

                    // Save the current config so we know when the config changes.
                    originalViewConfig = removeConfigsForComparison(JSON.parse(JSON.stringify(currentView.value)));

                    // If this is a new board ...
                    if (currentView.value.name.trim().length === 0) {
                        // Start with the configuration open
                        showConfiguration.value = true;
                        // Focus the name textbox
                        setTimeout(() => (viewNameRef.value as any).$el.getElementsByTagName('input')[0].focus(), 0);
                        // And don't show the "Save as new view" or "Delete view" buttons
                        isNewView.value = true;
                    } else {
                        isNewView.value = false;
                    }
                } else {
                    originalViewConfig = null;
                }
            });

            emitter.register('viewContainerClose', 'closeView', (viewId: string) => {
                if (currentView.value?.id === viewId) {
                    closeView();
                }
            });
        });

        onUnmounted(() => {
            emitter.deregister('viewContainerClose');
        });

        function saveView() {
            let boardId = store.getters.currentProjectBoard?.boardId;
            if (boardId && currentView.value) {
                if (isValidConfig(currentView.value)) {
                    new SaveViewAction(JSON.parse(JSON.stringify(currentView.value))).submit();
                }
            }
        }
        function saveAsNewView() {
            if (currentView.value) {
                currentView.value.id = uuidv4();
                saveView();
            }
        }
        function deleteView() {
            let boardId = store.getters.currentProjectBoard?.boardId;
            if (boardId && currentView.value) {
                tidyAfterClose();
                setTimeout(() => {
                    if (boardId && currentView.value) {
                        new DeleteViewAction(currentView.value.id).submit();
                    }
                }, 500); // Long enough for the "close" transition to complete.
            }
        }

        return {
            currentView, showConfiguration, showView,
            isNewView,

            viewNameRef,

            closeView,
            saveView,
            saveAsNewView,
            deleteView,
        };
    }
})
</script>

<style lang="css">

@import url("../viewstyles.css");

.mw-app-viewcontainer {
    position: absolute;
    height: 100%;
    width: 100%;
    overflow: hidden; /* Hide the config section when the view is opening/closing. */
    z-index: 5;

    transition: transform 0.4s;
    transform: translateY(-100%);
    &.is-open { transform: translateY(0%); }

    .mwe-view-contents-section {
        height: 100%;
        width: 100%;
    }

    .mwe-view-config-wrapper {
        box-shadow: 4px 4px 4px var(--gray-very-dark);
        position: absolute;
        width: 100%;
        padding-top: 2px;
        background: var(--pink-purp-gradient);

        /* Opening/closing the config section */
        transition: transform 0.4s;
        &.is-visible { transform: translateY(-100%); }

        .mwe-view-config-section {
            background: var(--gray-very-dark);

            .mwe-config-tabs {
                position: absolute;
                transform: translateY(-100%);
                right: 50px;

                .mwe-config-tab {
                    display: inline-block;
                    background: var(--gray-very-dark);
                    padding: 10px 20px;
                    &:not(:first-child) {
                        border-left: 1px solid var(--gray3);
                    }
                    cursor: pointer;
                    &:hover {
                        background-color: var(--gray-dark);
                    }

                    svg {
                        padding: 0 10px;
                        transition: transform 0.8s;
                        transform: rotate(0deg);
                        &.is-rotated {
                            transform: rotate(180deg);
                        }
                    }
                }
            }

            .mwe-view-config {
                margin: 0 auto;
                padding: 20px;
                background: var(--gray-very-dark);
                max-width: 1000px;

                .mw-textbox { display: inline-block; }

                .mwe-config-content {
                    max-height: 50vh;
                    overflow-y: auto;
                    padding: 20px;
                    >* { margin: 20px 0; }

                    .mw-app-filterconfig {
                        margin: 10px 50px;
                    }
                }
            }

            .mwe-view-save-button-wrapper {
                background: var(--pink-purp-gradient);
                padding-top: 1px;

                .mwe-view-save-buttons {
                    background: var(--gray-very-dark);
                    padding: 10px;
                    text-align: right;

                    button { margin: 10px; }
                }
            }
        }
    }
}

</style>
