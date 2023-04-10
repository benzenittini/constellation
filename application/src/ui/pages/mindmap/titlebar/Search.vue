<template>
    <div class="mw-app-search" v-bind:class="{ 'disable-pointer-events': pointerEventsDisabled }">

        <div class="mwe-app-search-outline">

            <!-- Search Criteria -->
            <div class="mwe-app-search-criteria" v-bind:class="{ 'mwm-results-shown': showSearchResults }"> <!-- Pink border -->
                <div class="mwe-app-search-contents">
                    <!-- Search Configuration -->
                    <eic-basic-search
                        v-on:mw-search-criteria-change="updateSearchCriteria($event)"
                        v-on:mw-show-search-results="showSearchResults = true"
                        v-on:mw-hide-search-results="showSearchResults = false"
                        ></eic-basic-search>
                </div>
            </div>

            <!-- Search Results -->
            <div v-if="searchResults && showSearchResults" class="mwe-search-results">
                <div v-if="searchResults.length === 0">
                    No results were found.
                </div>
                <div v-for="result, i in searchResults" v-bind:key="result.blockId"
                    class="mwe-search-result"
                    v-bind:class="{ 'is-selected': selectedSearchResult === i }"
                    v-bind:style="getBlockStyle(result.block)"
                    v-on:mouseenter="selectedSearchResult = i"
                    v-on:click="panToBlock(result.blockId)">
                    <div v-if="result.breadcrumbs.length > 0" class="mwe-breadcrumbs">
                        {{ result.breadcrumbs.join(" > ") }}
                    </div>
                    <div class="mwe-summary-text">
                        {{ result.summaryText }}
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, Ref, ref } from "vue";

import { Block, SearchCriteria, SearchResult } from "constellation-common";
import { useEmitter } from "../../../composables/Emitter";
import { useWindowEvents } from "../../../composables/WindowEvents";
import { useStore } from "../../../store/store";

export default defineComponent({
    setup() {
        const store = useStore();
        const eventEmitter = useEmitter();
        const windowEvents = useWindowEvents();

        let searchResults: Ref<SearchResult[] | undefined> = ref(undefined);
        let selectedSearchResult: Ref<number> = ref(-1);
        let showSearchResults: Ref<boolean> = ref(false);

        function panToBlock(blockId: string) {
            // Defocus the search textbox
            (document.activeElement as HTMLElement).blur();

            store.dispatch("selectBlock", {blockId, clearCurrentSelection: true});
            eventEmitter.emit('goToBlock', blockId);

            // Hide the search results
            showSearchResults.value = false;
        }

        onMounted(() => {
            eventEmitter.register('nextSearchResult', 'nextSearchResult', () => {
                if (searchResults.value && searchResults.value.length > selectedSearchResult.value+1) {
                    selectedSearchResult.value++;
                }
            });
            eventEmitter.register('previousSearchResult', 'previousSearchResult', () => {
                if (searchResults.value && selectedSearchResult.value > 0) {
                    selectedSearchResult.value--;
                }
            });

            windowEvents.register('searchEvents', 'keydown', (keyboardEvent: KeyboardEvent) => {
                switch (keyboardEvent.key) {
                    case "Enter":
                        if (searchResults.value && selectedSearchResult.value !== -1 && showSearchResults.value) {
                            panToBlock(searchResults.value[selectedSearchResult.value].blockId);
                        }
                        break;
                }
            }, false);
        });
        onUnmounted(() => {
            eventEmitter.deregister('nextSearchResult');
            eventEmitter.deregister('previousSearchResult');
            windowEvents.deregisterAll();
        });

        return {
            searchResults,
            selectedSearchResult,
            showSearchResults,
            updateSearchCriteria: (searchCriteria: SearchCriteria) => {
                if ('searchTerm' in searchCriteria && searchCriteria.searchTerm.trim().length === 0) {
                    searchResults.value = undefined;
                } else {
                    searchResults.value = store.getters.blockSearch(searchCriteria);
                }

                if (searchResults.value && searchResults.value.length > 0) {
                    selectedSearchResult.value = 0;
                } else {
                    selectedSearchResult.value = -1;
                }
            },
            panToBlock,
            pointerEventsDisabled: store.getters.pointerEventsDisabled,
            getBlockStyle: (block: Block) => {
                return store.getters.getCssStyles(block, 1);
            },
        }
    },
})
</script>

<style lang="scss">

@use "sass:color";
@use "../../../styles/variables" as vars;
@use '../viewstyles';

$border-radius: vars.$radius-medium;
$search-bar-height: 35px;

.mw-app-search {

    height: $search-bar-height;
    overflow: visible;

    &.disable-pointer-events {
        pointer-events: none;
    }

    .mwe-app-search-outline {
        border: 1px solid vars.$gray2;
        border-radius: $border-radius;
        background: vars.$gray-very-dark;

        .mwe-app-search-criteria {
            border-radius: $border-radius;
            margin: -1px;
            padding: 1px;

            &:focus-within {
                background: vars.$pink-purp-gradient;
            }

            .mwe-app-search-contents {
                color: vars.$gray3;
                background: vars.$gray-very-dark;
                border-radius: $border-radius;
                min-height: $search-bar-height;
                height: 1px; // Oh css, how you woo me <3 https://stackoverflow.com/a/21836870
            }
        }

        .mwe-search-results {
            padding: 10px;
            max-height: 40vh;
            overflow: auto;

            .mwe-select-all-results {
                cursor: pointer;
                display: inline-block;
                padding: 10px 20px;
                &:hover { text-decoration: underline; }
            }

            .mwe-search-result {
                border: 3px solid vars.$gray3;
                border-radius: 20px;
                margin: 10px;
                cursor: pointer;

                &.is-selected {
                    @include viewstyles.block-is-selected;
                }

                .mwe-breadcrumbs {
                    padding: 10px 15px;
                    color: vars.$gray3;
                    background: color.adjust(vars.$gray-very-dark, $alpha: -0.4);
                    border-radius: 17px 17px 0 0;
                    border-bottom: 1px solid color.adjust(vars.$gray3, $alpha: -0.6);
                }
                .mwe-summary-text {
                    padding: 13px 15px 17px 15px;
                }
            }
        }
    }
}
</style>
