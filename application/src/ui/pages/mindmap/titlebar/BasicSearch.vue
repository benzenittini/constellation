<template>
    <div class="mw-app-search-basicsearch" v-on:click="focusSearchArea()">
        <div v-show="!isSearching" class="mwe-is-not-searching">
            <eic-svg-magnifying-glass width="20" height="20"></eic-svg-magnifying-glass>
            <span class="mwe-search-placeholder">Search... ("/")</span>
        </div>
        <div v-show="isSearching" class="mwe-is-searching">
            <eic-svg-magnifying-glass width="20" height="20"></eic-svg-magnifying-glass>
            <input type="text"
                ref="searchTextbox"
                v-model="searchTerm"
                v-on:focus="focusTextbox()"
                v-on:blur="blurTextbox()"
                v-on:input="updateSearchTerm()"
                v-on:keydown="handleKeypress"/>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import { useEmitter } from "../../../composables/Emitter";

export default defineComponent({
    setup(props, context) {
        const emitter = useEmitter();

        let isSearching = ref(false);
        let searchTerm = ref('');
        let searchTextbox = ref(null as unknown as HTMLInputElement);

        function focusTextbox() {
            isSearching.value = true;
            searchTextbox.value.select();
            context.emit('mw-show-search-results');
        }
        function blurTextbox() {
            if (searchTerm.value === '') {
                isSearching.value = false;
            }
            setTimeout(() => context.emit('mw-hide-search-results'), 200);
        }
        function focusSearchArea() {
            focusTextbox();
            // Need to wait for "isSearching" to be 'true' before focusing, hence the setTimeout()
            setTimeout(() => searchTextbox.value.focus(), 0);
        }

        function cancelSearch() {
            if (searchTimeoutRef) {
                clearTimeout(searchTimeoutRef);
            }
            searchTerm.value = '';
            searchTextbox.value.blur()
        }

        const SEARCH_DELAY_MS = 500;
        let searchTimeoutRef: number | null = null;
        function submitSearch() {
            searchTimeoutRef = null;
            context.emit('mw-search-criteria-change', { searchTerm: searchTerm.value.trim() });
        }
        function updateSearchTerm() {
            if (searchTimeoutRef) {
                clearTimeout(searchTimeoutRef);
            }
            searchTimeoutRef = window.setTimeout(() => submitSearch(), SEARCH_DELAY_MS);
        }
        function handleKeypress(event: KeyboardEvent) {
            switch (event.key) {
                case "Enter":
                    if (searchTimeoutRef) {
                        event.preventDefault();
                        clearTimeout(searchTimeoutRef);
                        submitSearch();
                    }
                    break;
                case "Escape":
                    event.preventDefault();
                    cancelSearch();
                    break;
                case "Down": // IE/Edge
                case "ArrowDown":
                    event.preventDefault();
                    emitter.emit('nextSearchResult');
                    break;
                case "Up": // IE/Edge
                case "ArrowUp":
                    event.preventDefault();
                    emitter.emit('previousSearchResult');
                    break;
            }
        }

        onMounted(() => {
            emitter.register('basicFocusSearch', 'focusSearch', () => { focusSearchArea(); });
        });
        onUnmounted(() => {
            emitter.deregister('basicFocusSearch');
        });

        return {
            // Refs
            searchTextbox,
            isSearching,
            searchTerm,

            // Methods
            updateSearchTerm,
            handleKeypress,
            focusSearchArea,
            focusTextbox,
            blurTextbox,
        }
    },
})
</script>

<style>

.mw-app-search-basicsearch {
    height: 100%;

    .mwe-is-not-searching {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: text;
        .mwe-search-placeholder {
            color: var(--gray3);
            padding: 0 5px;
        }
    }
    .mwe-is-searching {
        height: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 0 10px;
        input[type="text"] {
            flex-grow: 1;
            border: none;
            background: transparent;
            outline: none;
            color: var(--gray-very-light);
            font-weight: bold;
        }
        .mw-svg-magnifyingglass {
            stroke: var(--gray-very-light);
        }

        .mwe-is-selected { color: var(--gray-very-light); }
    }
}
</style>
