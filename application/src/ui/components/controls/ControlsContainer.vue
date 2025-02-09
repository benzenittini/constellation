<template>
    <div id="mw-controlscontainer">
        <h1 class="mwe-controls-title">{{ getControlsTitle(activeViewType) }}</h1>
        <eic-mind-map-controls v-if="activeViewType === undefined"></eic-mind-map-controls>
        <eic-filter-controls v-else-if="activeViewType === 'FILTER'"></eic-filter-controls>
        <eic-kanban-controls v-else-if="activeViewType === 'KANBAN'"></eic-kanban-controls>
        <p class="mwe-support-note">For support, please reach out to <a v-bind:href="'mailto:' + SUPPORT_EMAIL">{{ SUPPORT_EMAIL }}</a></p>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

import { ViewType } from 'constellation-common/datatypes';
import { Constants } from 'constellation-common/utilities';

import { useStore } from "../../store/store";


export default defineComponent({
    props: {},
    setup() {
        const store = useStore();

        let activeViewType = computed(() => store.state.viewData.activeViewConfig?.type);

        return {
            SUPPORT_EMAIL: Constants.SUPPORT_EMAIL,
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

<style lang="css">

#mw-controlscontainer {
    .mwe-controls-title {
        margin: 0;
        padding: 0;
        position: absolute;
        top: 10px;
        left: 10px;
        font-size: 16px;
        font-weight: bold;
        color: var(--gray4);
    }

    .mwe-support-note {
        text-align: center;
        color: var(--gray4);
        margin: 0 0 20px 0;
    }

    h2 {
        text-align: center;
        margin: 0 5px 10px 5px;
    }

    .mw-controls-row {
        margin: 50px auto;
        width: 100%;

        .mw-controls-horiz-flex {
            display: flex;
            flex-direction: row;
            justify-content: space-evenly;
            gap: 50px;
        }

        .mw-controls-inner-flex {
            display: flex;
            flex-direction: row;
            justify-content: space-evenly;
            gap: 30px;
        }
    }

    figure {
        text-align: center;
        margin: 0;
        vertical-align: top;
        .fig-icon {
            min-height: 70px;
            &>* {
                padding: 5px;
                vertical-align: middle;
            }
            .or-text {
                line-height: 70px;
                color: var(--gray3);
            }
            .x2-text {
                vertical-align: bottom;
                color: var(--gray3);
                font-weight: bold;
                font-size: 1.5em;
            }
        }
        figcaption {
            margin-top: 5px;
            max-width: 200px;
        }
        .long-caption {
            max-width: 300px;
        }
    }

}

</style>
