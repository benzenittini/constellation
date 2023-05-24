<template>
    <div id="mw-local-boards">
        <table>
            <tr v-for="board in localBoards"
                v-bind:key="board.boardId"
                v-on:click="openBoard(LOCAL_PROJECT, board.boardId)">
                <td>{{ board.boardName }}</td>
                <td>{{ board.boardId }}</td>
                <td class="mw-deletion-column"><eic-svg-deletion-x width="25px"
                    v-on:click.stop="deleteBoard(LOCAL_PROJECT, board.boardId)"
                    ></eic-svg-deletion-x></td>
            </tr>
        </table>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useBoardOperations } from '../../composables/BoardOperations';
import { LOCAL_PROJECT } from 'constellation-common/datatypes';
import { useStore } from '../../store/store';

export default defineComponent({
    setup(props) {
        const store    = useStore();
        const boardOps = useBoardOperations();

        return {
            ...boardOps,
            LOCAL_PROJECT,
            localBoards: computed(() => Object.values(store.state.generalData.projectData[LOCAL_PROJECT]?.boards || [])),
        }
    },
});
</script>

<style lang="scss">

@use "../../styles/variables" as vars;
@use "./styles";

#mw-local-boards {
    table {
        $table-margin: 24px;
        width: calc(100% - $table-margin - $table-margin);
        margin: $table-margin;
        border-collapse: collapse;
        td {
            border-top: 2px solid vars.$gray2;
            border-bottom: 2px solid vars.$gray2;
            padding: 12px 8px;

            &.mw-deletion-column { text-align: right; }
        }
        tr {
            cursor: pointer;
            .mw-svg-deletionx {
                transition: opacity 0.2s;
                opacity: 0;
            }
            &:hover {
                background: vars.$gray2;
                .mw-svg-deletionx { opacity: 1; }
            }
        }
    }
}

</style>
