
import { computed } from 'vue';
import { v4 as uuidv4 } from 'uuid';

import { useStore } from './store';
import { Store } from './StoreTypes';
import { Conjunction, KanbanViewConfig, ViewConfig, ViewType } from './Types/ViewDataTypes';


// =======
// Getters
// -------

function availableViews(store: Store, viewType?: ViewType) {
    return computed(() => Object.values(store.state.viewData.availableViews)
        .sort((a, b) => ('' + a.name).localeCompare(b.name))
        .filter(view => viewType ? view.type === viewType : true));
}
function activeViewConfig(store: Store) {
    return computed(() => store.state.viewData.activeViewConfig);
}
function displayedBlocks(store: Store) {
    return computed(() => store.getters.displayedBlocks);
}
function prioritizedBlocks(store: Store) {
    return computed(() => store.getters.prioritizedBlocks);
}


// =======
// Setters
// -------

function createNewView(store: Store, viewType: ViewType) {
    // We're creating/opening a new view ONLY IN THE STORE. This view is temporary, and will not be persisted
    // until the user hits "save". If another view gets opened before saving, this temporary view gets lost.
    let newView: ViewConfig = {
        id: uuidv4(),
        name: '',
        type: viewType,
        filter: {
            filters: [],
            conjunction: Conjunction.AND,
        },
    };

    store.dispatch('openView', newView);
}

function closeCurrentView(store: Store) {
    store.dispatch('closeView');
}


// ========
// Exports!
// --------

export function useViewStore() {
    let store = useStore();

    return {
        rawState: store.state.viewData,

        // -- Getters --
        availableViews:    (viewType?: ViewType) => availableViews(store, viewType),
        activeViewConfig:  () => activeViewConfig(store),
        displayedBlocks:   () => displayedBlocks(store),
        prioritizedBlocks: () => prioritizedBlocks(store),

        // -- Setters --
        createNewView:       (viewType: ViewType) => createNewView(store, viewType),
        closeCurrentView:    () => closeCurrentView(store),
    };
}