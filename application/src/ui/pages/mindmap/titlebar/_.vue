<template>
    <div class="mw-app-titlebar">
        <div class="view-icons">
            <eic-view-selector mw-view-type="filter" :mw-is-available="true" title="Filters"></eic-view-selector>
            <eic-view-selector mw-view-type="kanban" :mw-is-available="true" title="Kanban Boards"></eic-view-selector>
        </div>

        <eic-search class="app-search"></eic-search>

        <div class="go-to-projects" v-on:click="backToProjects()">
            <eic-svg-arrow-2 width="30" height="30"></eic-svg-arrow-2>
            <span>Board Selection</span>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { useStore } from "../../../store/store";

export default defineComponent({
    props: {},
    setup() {
        return {
            backToProjects: () => {
                useStore().dispatch('clearBoardState');
            },
        }
    }
})
</script>

<style lang="scss">
@use "../../../styles/variables" as vars;
@use "../../../styles/mixins";

.mw-app-titlebar {
    display: flex;
    align-items: center;
    z-index: 10;

    background: vars.$gray-very-dark;
    padding: 10px;

    &>* {
        flex: 0 0 250px;
        margin-left: 50px;
        margin-right: 50px;
    }
    .view-icons>* {
        margin: 0 10px;
    }
    .app-search { flex-grow: 1; }

    .go-to-projects {
        text-align: right;
        cursor: pointer;
        span {
            vertical-align: middle;
            margin-left: 5px;
            color: vars.$gray3;
        }
        .mw-svg-arrow2 {
            transform: scaleX(-1);
            transform-origin: center;
            transition: transform 0.4s;
            stroke: vars.$gray3;
        }
        &:hover {
            span { color: vars.$gray-very-light; }
            .mw-svg-arrow2 { stroke: vars.$gray-very-light; transform: translateX(-10px) scaleX(-1); }
        }
    }
}

</style>
