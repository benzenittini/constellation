<template>
    <div id="mw-projects">
        <!-- Local Boards -->
        <div class="mw-board-list">
            <h2>{{ LOCAL_PROJECT_NAME }}</h2>
            <table>
                <tr v-for="board in localBoards"
                    v-bind:key="board.boardId"
                    v-on:click="openBoard(LOCAL_PROJECT, board.boardId)">
                    <td>{{ board.boardName }}</td>
                    <td>{{ board.boardId }}</td>
                </tr>
            </table>
            <div class="mw-button-group">
                <button class="tertiary green" v-on:click="importBoard(LOCAL_PROJECT)">Import Board</button>
                <button class="primary green" v-on:click="createBoard(LOCAL_PROJECT)">Create Board</button>
            </div>
        </div>

        <!-- Remote Boards -->
        <div class="mw-board-list"
            v-for="project in remoteProjects"
            v-bind:key="project.projectId">
            <h2>{{ project.projectName }}</h2>
            <button class="tertiary yellow" v-on:click="leaveRemoteProject(project.projectId)">Leave Project</button>
            <div class="mw-board-blocks">
                <div class="mw-board-block" v-for="board in Object.values(project.boards)"
                    v-bind:key="board.boardId"
                    v-on:click="openBoard(project.projectId, board.boardId)"
                    >{{ board.boardName }}</div>
            </div>
            <div class="mw-button-group">
                <button class="tertiary green" v-on:click="importBoard(project.projectId)">Import Board</button>
                <button class="primary green" v-on:click="createBoard(project.projectId)">Create Board</button>
            </div>
        </div>

        <div class="mw-board-list">
            <button class="primary pink" v-on:click="addRemoteProject()">Add Remote Project</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, reactive } from 'vue';
import { useVueModals } from 'mw-vue-modals';

import { useStore } from '../../store/store';
import { LOCAL_PROJECT, LOCAL_PROJECT_NAME, TemplateClassification } from '../../../../../common/DataTypes/BoardDataTypes';

import { GetProjectDataAction } from '../../actions/project-actions/GetProjectData';
import { GetRemoteProjectsAction } from '../../actions/project-actions/GetRemoteProjects';
import { CreateNewBoardAction } from '../../actions/project-actions/CreateNewBoard';
import { ImportBoardAction } from '../../actions/project-actions/ImportBoard';
import { LeaveProjectAction } from '../../actions/project-actions/LeaveProject';
import { JoinProjectAction } from '../../actions/project-actions/JoinProject';

export default defineComponent({
    setup() {
        const store = useStore();

        const CREATE_BOARD_DIALOG_ID = 'create-board-dialog';

        onMounted(() => {
            document.title = "Constellation";

            // Prep the local project/boards
            new GetProjectDataAction().submit();

            // Prep the remote projects/boards
            new GetRemoteProjectsAction().submit();
        });


        return {
            LOCAL_PROJECT, LOCAL_PROJECT_NAME,

            localBoards: computed(() => Object.values(store.state.generalData.projectData[LOCAL_PROJECT]?.boards || [])),
            remoteProjects: computed(() => Object.values(store.state.generalData.projectData).filter(project => project.projectId !== LOCAL_PROJECT)),

            createBoard: (projectId: string) => {
                type CreateBoardModalData = {
                    projectId: string,
                    saveData: { boardName: string, fileName: string, classifications: TemplateClassification[] },
                };
                let modalData: CreateBoardModalData = reactive(JSON.parse(JSON.stringify({
                    projectId,
                    saveData: { boardName: '', fileName: '', classifications: [] },
                })));

                let mwVueModals = useVueModals();
                mwVueModals.createOrUpdateModal({
                    id: CREATE_BOARD_DIALOG_ID,
                    styleOverrides: {
                        'width': '650px',
                    },
                    layout: {
                        componentName: 'mw-vm-fixed-bottom',
                        panes: {
                            'bottom': {
                                name: 'eic-savecancel',
                                componentData: { mwSaveText: 'Create Board' },
                                eventHandlers: {
                                    'mw-cancel':  (event: any) => { mwVueModals.closeModal(CREATE_BOARD_DIALOG_ID); },
                                    'mw-save':  (event: any) => {
                                        let { boardName, fileName, classifications } = modalData.saveData;
                                        let boardOrFileName = (boardName !== '') ? boardName : fileName;
                                        new CreateNewBoardAction(
                                            projectId,
                                            JSON.parse(JSON.stringify(classifications)),
                                            boardOrFileName,
                                        ).submit();
                                        // TODO-const : Close modal if successful, or show error if it's not!
                                        mwVueModals.closeModal(CREATE_BOARD_DIALOG_ID);
                                    },
                                }
                            },
                            'main': {
                                componentName: 'eic-create-board-dialog',
                                componentData: modalData,
                                styleOverrides: {
                                    'max-height': '500px',
                                },
                                eventHandlers: {
                                }
                            }
                        }
                    }
                });
            },
            importBoard: (projectId: string) => {
                new ImportBoardAction(projectId).submit();
            },
            openBoard: (projectId: string, boardId: string) => {
                store.dispatch('setCurrentProjectBoard', { projectId, boardId });
            },
            leaveRemoteProject: (projectId: string) => {
                let remoteProject = store.getters.getRemoteProjectById(projectId);
                if (remoteProject) {
                    new LeaveProjectAction(JSON.parse(JSON.stringify(remoteProject)), projectId).submit();
                } else {
                    // TODO-const : shouldn't ever come up ... throw an error if it does..? or ignore?
                    console.error("Unexpected error when leaving a remote project.");
                }
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
@use "../../styles/mixins";

#mw-projects {
    width: 100%;
    padding: 32px;
    .mw-board-list {
        background: vars.$gray1;
        margin: 32px;
        padding: 24px 32px;
        border-radius: vars.$radius-medium;

        h2 {
            margin: 0;
            padding: 0;
            display: inline-block;
        }

        table {
            $table-margin: 24px;
            width: calc(100% - $table-margin - $table-margin);
            margin: $table-margin;
            border-collapse: collapse;
            td {
                border-top: 2px solid vars.$gray2;
                border-bottom: 2px solid vars.$gray2;
                padding: 12px 8px;
            }
            tr {
                cursor: pointer;
                &:hover { background: vars.$gray2; }
            }
        }

        .mw-button-group {
            text-align: right;
            button { margin: 0 5px; }
        }

        .mw-board-blocks {
            display: flex;
            margin: 24px;
            .mw-board-block {
                @include mixins.lift-up(5px);
                background: vars.$gray0;
                border-radius: vars.$radius-small;
                border: 2px solid vars.$pink-medium;
                padding: 32px 48px;
                cursor: pointer;
            }
        }
    }
}

</style>
