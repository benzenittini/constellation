
import { createStore } from 'vuex';

import { generalDataStore } from './generalData';
import { entityDataStore } from './entityData';
import { Store } from './StoreTypes';
import { hierarchyDataStore } from './hierarchyData';
import { fieldDataStore } from './fieldData';
import { viewDataStore } from './viewData';

export let store = createStore({
    modules: {
        generalData: generalDataStore,
        entityData: entityDataStore,
        hierarchyData: hierarchyDataStore,
        fieldData: fieldDataStore,
        viewData: viewDataStore,
    }
});

export function useStore() {
    return store as Store;
}
