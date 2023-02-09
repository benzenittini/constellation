<template>
    <svg class="mw-svg-kanban" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- This defines the borders, and makes the whole icon "hoverable" -->
        <rect x="0" y="0" width="34" height="34" stroke="transparent" fill="transparent" />

        <!-- The rest of the icon -->
        <!-- Headings -->
        <rect x="0" y="0" width="10" height="4" class="kanban-heading" />
        <rect x="12" y="0" width="10" height="4" class="kanban-heading" />
        <rect x="24" y="0" width="10" height="4" class="kanban-heading" />
        <!-- Column 1 -->
        <rect x="0.5" y="8.5" width="9" height="25" class="kanban-column" />
        <rect x="1" y="9" width="8" height="4" class="kanban-block" />
        <rect x="1" y="15" width="8" height="4" class="kanban-block" />
        <rect x="1" y="21" width="8" height="4" class="kanban-block" />
        <!-- Column 2 -->
        <rect x="12.5" y="8.5" width="9" height="25" class="kanban-column" />
        <rect x="13" y="9" width="8" height="4" class="kanban-block" />
        <rect x="13" y="15" width="8" height="4" class="kanban-block" />
        <rect x="13" y="21" width="8" height="4" class="kanban-block" />
        <rect x="13" y="27" width="8" height="4" class="kanban-block" />
        <!-- Column 3 -->
        <rect x="24.5" y="8.5" width="9" height="25" class="kanban-column" />
        <rect x="25" y="9" width="8" height="4" class="kanban-block" />

    </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    setup() {
        return {}
    },
})
</script>

<style lang="scss">
@use "../styles/variables" as vars;

.mw-svg-kanban {
    .kanban-heading { stroke: none;        fill: vars.$gray3; }
    .kanban-column  { stroke: vars.$gray3; fill: vars.$gray3; }
    .kanban-block   { stroke: none;        fill: vars.$gray-very-dark; }

    &.active {
        .kanban-heading { stroke: none;        fill: vars.$gray7; }
        .kanban-column  { stroke: vars.$gray7; fill: vars.$gray7; }
    }
}

</style>