<template>
    <div class="mw-app-viewselector"
        v-on:mouseenter="showAvailableViews = true"
        v-on:mouseleave="showAvailableViews = false">
        <!-- Icon -->
        <eic-svg-filter        v-if="mwViewType === 'filter'"   width="34" height="34" v-on:click="closeIfOpen()" v-bind:class="{ 'active': isOpen }" ></eic-svg-filter>
        <eic-svg-kanban   v-else-if="mwViewType === 'kanban'"   width="34" height="34" v-on:click="closeIfOpen()" v-bind:class="{ 'active': isOpen }" ></eic-svg-kanban>

        <!-- List of available views -->
        <div v-if="showAvailableViews && mwIsAvailable" class="mwe-available-view-list">
            <div v-for="view in availableViews" v-bind:key="view.id"
                class="mwe-view-list-item"
                v-on:click="loadView(view.id)">
                {{ view.name }}
            </div>
            <div class="mwe-create-new-view" v-on:click="createNewView()">Create new {{ mwViewType }} view</div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import { v4 as uuidv4 } from 'uuid';

import { useStore } from "../../../store/store";
import { useEmitter } from "../../../composables/Emitter";

import { GENERIC_RESTART, Conjunction, ViewConfig, ViewType } from "constellation-common";
import { LoadViewAction } from "../../../actions/board-actions/LoadView";
import { E32, showError } from "../../../ErrorLogger";

export default defineComponent({
    props: {
        mwViewType: String,
        mwIsAvailable: Boolean,
    },
    setup(props) {
        const store = useStore();
        const emitter = useEmitter();

        let activeViewConfig = computed(() => store.state.viewData.activeViewConfig);
        let isOpen = computed(() => activeViewConfig.value?.type === props.mwViewType?.toUpperCase());

        return {
            isOpen,
            showAvailableViews: ref(false),
            availableViews: computed(() => store.getters.availableViewsForType(props.mwViewType!.toUpperCase() as ViewType)),
            closeIfOpen: () => {
                if (isOpen.value) {
                    emitter.emit('closeView', activeViewConfig.value?.id);
                }
            },
            createNewView: () => {
                // We're creating/opening a new view ONLY IN THE STORE. This view is temporary, and will not be persisted
                // until the user hits "save". If another view gets opened before saving, this temporary view gets lost.
                let newView: ViewConfig = {
                    id: uuidv4(),
                    name: '',
                    type: (props.mwViewType!.toUpperCase() as ViewType),
                    filter: {
                        filters: [],
                        conjunction: Conjunction.AND,
                    },
                };

                store.dispatch('openView', newView);
            },
            loadView: (viewId: string) => {
                if (!store.getters.currentProjectBoard?.boardId) {
                    showError(E32, [GENERIC_RESTART]);
                } else {
                    new LoadViewAction(viewId).submit();
                }
            },
        };
    }
});
</script>

<style lang="scss">
@use "../../../styles/variables" as vars;

.mw-app-viewselector {
    display: inline-block;

    svg.active { cursor: pointer; }
    
    .mwe-available-view-list {
        position: absolute;
        background: vars.$gray-very-dark;
        border-radius: 6px;
        box-shadow: 4px 4px 4px vars.$gray-very-dark;

        .mwe-view-list-item {
            padding: 15px;
            cursor: pointer;
            border-top: 1px solid transparent;
            border-bottom: 1px solid transparent;

            &:hover {
                background: vars.$gray-dark;
                border-color: vars.$gray4;
            }
        }
        
        .mwe-create-new-view {
            padding: 20px;
            color: vars.$gray4;
            text-align: center;
            cursor: pointer;
            &:hover {
                color: vars.$gray-very-light;
            }
        }
    }
}

</style>
