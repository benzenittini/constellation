<template>
    <div class="mw-app-titlebar">
        <div class="view-icons">
            <eic-view-selector mw-view-type="filter" :mw-is-available="true" title="Filters"></eic-view-selector>
            <eic-view-selector mw-view-type="kanban" :mw-is-available="true" title="Kanban Boards"></eic-view-selector>
        </div>

        <eic-search class="app-search"></eic-search>

        <!-- TODO-const : This is a placeholder until we add a project/board navigator here. -->
        <div></div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {},
    setup() {
        return {
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
}

</style>
