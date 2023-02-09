<template>
    <div id="mw-controlscontainer">
        <h1 class="mwe-controls-title">{{ getControlsTitle(activeViewType) }}</h1>
        <eic-mind-map-controls v-if="activeViewType === undefined"></eic-mind-map-controls>
        <eic-filter-controls v-else-if="activeViewType === 'FILTER'"></eic-filter-controls>
        <eic-kanban-controls v-else-if="activeViewType === 'KANBAN'"></eic-kanban-controls>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { ViewType } from "../../store/Types/ViewDataTypes";

import { useViewStore } from "../../store/ViewStore";

export default defineComponent({
    props: {},
    setup() {
        const viewStore = useViewStore();

        let activeViewType = computed(() => viewStore.activeViewConfig()?.value?.type);

        return {
            activeViewType,
            getControlsTitle: (viewType: ViewType | undefined) => {
                if      (viewType === undefined)       return 'Mind Map Controls';
                else if (viewType === ViewType.FILTER) return 'Filter View Controls';
                else if (viewType === ViewType.KANBAN) return 'Kanban View Controls';
            },
        };
    }
})
</script>

<style lang="scss">
@use "../../styles/variables" as vars;

#mw-controlscontainer {
    .mwe-controls-title {
        margin: 0;
        padding: 0;
        position: absolute;
        top: 10px;
        left: 10px;
        font-size: 16px;
        font-weight: bold;
        color: vars.$gray3;
    }
}

</style>
