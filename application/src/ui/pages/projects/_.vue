<template>
    <div id="mw-projects">
        <!-- Local Boards -->
        <div class="mw-board-list">
            <h2>{{ LOCAL_PROJECT_NAME }}</h2>
            <ul>
                <li v-for="board in localBoards"
                    v-bind:key="board.boardId"
                    v-on:click="openBoard(LOCAL_PROJECT, board.boardId)">{{ board.boardName }} - {{ board.boardId }}</li>
            </ul>
            <button class="secondary green" v-on:click="importBoard(LOCAL_PROJECT)">Import Board</button>
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

        <button class="primary pink" v-on:click="addRemoteProject()">Add Remote Project</button>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, reactive } from 'vue';
import { useVueModals } from 'mw-vue-modals';

import { useStore } from '../../store/store';
import { LOCAL_PROJECT, LOCAL_PROJECT_NAME } from '../../../../../common/DataTypes/BoardDataTypes';

import { GetProjectDataAction } from '../../actions/project-actions/GetProjectData';
import { GetRemoteProjectsAction } from '../../actions/project-actions/GetRemoteProjects';
import { CreateNewBoardAction } from '../../actions/project-actions/CreateNewBoard';
import { ImportBoardAction } from '../../actions/project-actions/ImportBoard';
import { JoinProjectAction } from '../../actions/project-actions/JoinProject';

export default defineComponent({
    setup() {
        const store = useStore();

        onMounted(() => {
            document.title = "Spacia";

            // Prep the local project/boards
            new GetProjectDataAction().submit();

            // Prep the remote projects/boards
            new GetRemoteProjectsAction().submit();
        });


        return {
            LOCAL_PROJECT, LOCAL_PROJECT_NAME,

            localBoards: computed(() => Object.values(store.state.generalData.projectData[LOCAL_PROJECT]?.boards || [])),
            remoteProjects: computed(() => Object.values(store.state.generalData.projectData).filter(project => project.projectId !== LOCAL_PROJECT)),

            createBoard: (projectId: string, boardName?: string) => {
                new CreateNewBoardAction(projectId, boardName).submit();
            },
            importBoard: (projectId: string) => {
                new ImportBoardAction(projectId).submit();
            },
            openBoard: (projectId: string, boardId: string) => {
                store.dispatch('setCurrentProjectBoard', { projectId, boardId });
            },
            addRemoteProject: () => {
                const MODAL_ID = 'add-remote-project';

                let modalData: {
                    saveData: {
                        projectUrl: string,
                        registrationKey: string,
                        clientName: string,
                    },
                } = reactive(JSON.parse(JSON.stringify({
                    saveData: {
                        projectUrl: '',
                        registrationKey: '',
                        clientName: '',
                    },
                })));
                useVueModals().createOrUpdateModal({
                    id: MODAL_ID,
                    layout: {
                        componentName: 'mw-vm-fixed-bottom',
                        panes: {
                            'main': {
                                componentName: 'eic-add-remote-project-dialog',
                                componentData: modalData,
                            },
                            'bottom': {
                                name: 'eic-savecancel',
                                componentData: { mwSaveText: 'Add Project' },
                                eventHandlers: {
                                    'mw-cancel':  (event: any) => { useVueModals().closeModal(MODAL_ID); },
                                    'mw-save':  (event: any) => {
                                        let { projectUrl, registrationKey, clientName } = modalData.saveData;
                                        // Submit request to server. On success, close dialog. On error, show error.
                                        // TODO-const
                                        new JoinProjectAction(projectUrl, registrationKey, clientName).submit();
                                        // useVueModals().closeModal(MODAL_ID);
                                    },
                                }
                            },
                        }
                    }
                });
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
