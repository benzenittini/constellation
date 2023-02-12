
import { createStore } from 'vuex';

import { generalDataStore } from './generalData';
import { blockDataStore } from './blockData';
import { Store } from './StoreTypes';
import { hierarchyDataStore } from './hierarchyData';
import { fieldDataStore } from './fieldData';
import { viewDataStore } from './viewData';

export let store = createStore({
    modules: {
        generalData: generalDataStore,
        blockData: blockDataStore,
        hierarchyData: hierarchyDataStore,
        fieldData: fieldDataStore,
        viewData: viewDataStore,
    }
});

export function useStore() {
    return store as Store;
}
