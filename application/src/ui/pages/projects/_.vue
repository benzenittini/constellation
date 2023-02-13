<template>
    <div id="mw-projects">
        <!-- Local Boards -->
        <div class="mw-board-list">
            <h2>Local Boards</h2>
            <ul>
                <li v-for="board in localBoards"
                    v-bind:key="board.boardId"
                    v-on:click="openBoard(LOCAL_PROJECT, board.boardId)">{{ board.boardName }} - {{ board.boardId }}</li>
            </ul>
            <button class="primary green" v-on:click="createBoard(LOCAL_PROJECT)">Create Board</button>
        </div>

        <!-- Remote Boards -->
        <div class="mw-board-list"
            v-for="project in remoteProjects"
            v-bind:key="project.projectId">
            <h2>{{ project.projectName }}</h2>
            <ul>
                <li v-for="board in Object.values(project.boards)"
                    v-bind:key="board.boardId"
                    v-on:click="openBoard(project.projectId, board.boardId)">{{ board.boardName }}</li>
            </ul>
            <!-- TODO-const : Allow creating remote boards. Requires a board name. -->
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue';

import { useStore } from '../../store/store';

import { CreateNewBoardAction } from '../../actions/project-actions/CreateNewBoard';
import { GetBoardsForProjectAction } from '../../actions/project-actions/GetBoardsForProject';
import { GetRemoteProjectsAction } from '../../actions/project-actions/GetRemoteProjects';
import { LOCAL_PROJECT } from '../../../../../common/DataTypes/BoardDataTypes';

export default defineComponent({
    setup() {
        const store = useStore();

        onMounted(() => {
            // Prep the local project/boards
            store.dispatch('addProject', { projectId: LOCAL_PROJECT, projectName: "Local Boards", boards: {} });
            new GetBoardsForProjectAction(LOCAL_PROJECT).submit();

            // Prep the remote projects/boards
            new GetRemoteProjectsAction().submit((projectList) => {
                projectList.forEach(project => {
                    store.dispatch('addProject', project);
                    new GetBoardsForProjectAction(project.projectId).submit();
                })
            });
        });


        return {
            LOCAL_PROJECT,

            localBoards: computed(() => Object.values(store.state.generalData.projectData[LOCAL_PROJECT]?.boards || [])),
            remoteProjects: computed(() => Object.values(store.state.generalData.projectData).filter(project => project.projectId !== LOCAL_PROJECT)),

            createBoard: (projectId: string, boardName?: string) => {
                new CreateNewBoardAction(projectId, boardName).submit();
            },
            openBoard: (projectId: string, boardId: string) => {
                store.dispatch('setCurrentProjectBoard', { projectId, boardId });
            },
        }
    },
});
</script>

<style lang="scss">

@use "../../styles/variables" as vars;

#mw-projects {
    .mw-board-list {
        background: vars.$gray1;
    }
}

</style>
