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
                    <td class="mw-deletion-column"><eic-svg-deletion-x width="25px"
                        v-on:click.stop="deleteBoard(LOCAL_PROJECT, board.boardId)"
                        ></eic-svg-deletion-x></td>
                </tr>
            </table>
            <div class="mw-button-group">
                <button class="tertiary green" v-on:click="importBoard(LOCAL_PROJECT)">Import Board</button>
                <button class="primary green" v-on:click="createBoard(LOCAL_PROJECT)">Create Board</button>
            </div>
        </div>

        <!-- Remote Boards -->
        <div class="mw-board-list"
            v-for="remote in remoteProjects"
            v-bind:key="remote.projectId"
            v-bind:class="{ 'mw-connection-error': !projectMap[remote.projectId] }">
            <div v-if="!projectMap[remote.projectId]">
                <p>Could not connect to <span style="font-weight: bold">{{ remote.remoteProject.serverUrl }}</span></p>
                <button class="tertiary yellow" v-on:click="leaveRemoteProject(remote.projectId)">Leave Project</button>
                <button class="primary yellow" v-on:click="retryRemoteProject(remote.remoteProject)">Retry Connection</button>
            </div>
            <div v-else>
                <h2>{{ projectMap[remote.projectId].projectName }}</h2>
                <button class="tertiary yellow" v-on:click="leaveRemoteProject(remote.projectId)">Leave Project</button>
                <div class="mw-board-blocks">
                    <div class="mw-board-block" v-for="board in Object.values(projectMap[remote.projectId].boards)"
                        v-bind:key="board.boardId"
                        v-on:click="boardBeingEdited.boardId !== board.boardId && openBoard(remote.projectId, board.boardId)">
                        <span v-if="boardBeingEdited.boardId !== board.boardId">{{ board.boardName }}</span>
                        <input v-else type="text"
                            :ref="el => { if (el) editNameRefs[board.boardId] = el }"
                            v-bind:value="board.boardName"
                            v-on:blur="endEditBoard(board.boardName, $event.target.value)"
                            v-on:keydown="blurIfEnter($event)"/>
                        <eic-svg-pencil width="20px"
                            v-on:click.stop="beginEditBoard(remote.projectId, board.boardId)"></eic-svg-pencil>
                        <eic-svg-deletion-x class="inversion" width="25px"
                            v-on:click.stop="deleteBoard(remote.projectId, board.boardId)"
                            ></eic-svg-deletion-x>
                    </div>
                </div>
                <div class="mw-button-group">
                    <button class="tertiary green" v-on:click="importBoard(remote.projectId)">Import Board</button>
                    <button class="primary green" v-on:click="createBoard(remote.projectId)">Create Board</button>
                </div>
            </div>
        </div>

        <div class="mw-board-list">
            <button class="primary pink" v-on:click="addRemoteProject()">Add Remote Project</button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, reactive, ref, Ref, onBeforeUpdate } from 'vue';
import { useVueModals } from 'mw-vue-modals';

import { useStore } from '../../store/store';
import { BoardData, LOCAL_PROJECT, LOCAL_PROJECT_NAME, TemplateClassification } from '../../../../../common/DataTypes/BoardDataTypes';
import { RemoteProject } from '../../../../../common/DataTypes/FileDataTypes';
import { E1, E10, E11, E4, E5, E6, E7, E8, E9, showError } from '../../../common/ErrorLogger';

import { GetProjectDataAction } from '../../actions/project-actions/GetProjectData';
import { GetRemoteProjectsAction } from '../../actions/project-actions/GetRemoteProjects';
import { CreateNewBoardAction } from '../../actions/project-actions/CreateNewBoard';
import { ImportBoardAction } from '../../actions/project-actions/ImportBoard';
import { LeaveProjectAction } from '../../actions/project-actions/LeaveProject';
import { JoinProjectAction } from '../../actions/project-actions/JoinProject';
import { DeleteBoardAction } from '../../actions/project-actions/DeleteBoard';
import { UpdateBoardConfigAction } from '../../actions/project-actions/UpdateBoardConfig';
import { GENERIC_RESTART } from '../../../../../common/DataTypes/ActionDataTypes';

export default defineComponent({
    setup() {
        const store = useStore();

        const ADD_PROJECT_DIALOG_ID  = 'add-remote-project';
        const CREATE_BOARD_DIALOG_ID = 'create-board-dialog';
        const IMPORT_BOARD_DIALOG_ID = 'import-board-dialog';
        const DELETE_BOARD_DIALOG_ID = 'delete-board-dialog';

        onMounted(() => {
            document.title = "Constellation";

            // Prep the local project/boards
            new GetProjectDataAction().submit();

            // Prep the remote projects/boards
            new GetRemoteProjectsAction().submit();
        });

        let boardBeingEdited: Ref<{projectId?: string, boardId?: string}> = ref({projectId: undefined, boardId: undefined});
        // (see: https://v3.vuejs.org/guide/composition-api-template-refs.html#usage-inside-v-for)
        let editNameRefs: Ref<any[]> = ref([]); // classificationElements[]
        onBeforeUpdate(() => editNameRefs.value = []);

        return {
            LOCAL_PROJECT, LOCAL_PROJECT_NAME,

            boardBeingEdited,
            editNameRefs,

            localBoards: computed(() => Object.values(store.state.generalData.projectData[LOCAL_PROJECT]?.boards || [])),
            remoteProjects: computed(() => store.state.generalData.remoteProjectLookup),
            projectMap: computed(() => store.state.generalData.projectData),

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
                                        if (boardOrFileName && boardOrFileName.trim() !== '') {
                                            new CreateNewBoardAction(
                                                projectId,
                                                JSON.parse(JSON.stringify(classifications)),
                                                boardOrFileName,
                                            ).onSuccess(() => {
                                                mwVueModals.closeModal(CREATE_BOARD_DIALOG_ID);
                                            }).onError((error) => {
                                                showError(E4, [error.message || GENERIC_RESTART]);
                                            }).submit();
                                        } else {
                                            showError(E5, [projectId === LOCAL_PROJECT ? 'Filename' : 'Board name']);
                                        }
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
            beginEditBoard: (projectId: string, boardId: string) => {
                boardBeingEdited.value = { projectId, boardId };
                setTimeout(() => (editNameRefs.value as any)[boardId].select(), 0);
            },
            blurIfEnter: (event: KeyboardEvent) => {
                if (event.key === 'Enter' && boardBeingEdited.value.boardId) {
                    (editNameRefs.value as any)[boardBeingEdited.value.boardId].blur();
                }
            },
            endEditBoard: (currentName: string, newName: string) => {
                if (currentName !== newName) {
                    new UpdateBoardConfigAction(
                        boardBeingEdited.value.projectId!,
                        boardBeingEdited.value.boardId!,
                        { name: newName, },
                    ).onSuccess(() => {
                        boardBeingEdited.value = {};
                    }).onError(error => {
                        showError(E7, [error.message || GENERIC_RESTART]);
                    }).submit();
                }

            },
            deleteBoard: (projectId: string, boardId: string) => {
                type DeleteBoardModalData = {
                    saveData: { projectId: string, boardId: string, deleteFile?: boolean },
                };
                let modalData: DeleteBoardModalData = reactive(JSON.parse(JSON.stringify({
                    saveData: { projectId, boardId, deleteFile: false },
                })));

                const mwVueModals = useVueModals();
                mwVueModals.createOrUpdateModal({
                    id: DELETE_BOARD_DIALOG_ID,
                    styleOverrides: {
                        'width': '650px',
                    },
                    layout: {
                        componentName: 'mw-vm-fixed-bottom',
                        panes: {
                            'bottom': {
                                name: 'eic-savecancel',
                                componentData: { mwSaveText: 'Yes' },
                                eventHandlers: {
                                    'mw-cancel':  (event: any) => { mwVueModals.closeModal(DELETE_BOARD_DIALOG_ID); },
                                    'mw-save':  (event: any) => {
                                        let { projectId, boardId, deleteFile } = modalData.saveData;
                                        new DeleteBoardAction(projectId, boardId, deleteFile)
                                            .onSuccess(   () => mwVueModals.closeModal(DELETE_BOARD_DIALOG_ID))
                                            .onError((error) => showError(E6, [error.message || GENERIC_RESTART]))
                                            .submit();
                                    },
                                }
                            },
                            'main': {
                                componentName: 'eic-delete-board-dialog',
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
                if (projectId === LOCAL_PROJECT) {
                    new ImportBoardAction(projectId)
                        .onError(error => {
                            if (error.errorCode === 3) {
                                // Error code 3 indicates user closed window without choosing file.
                                // No need to display any problems.
                            } else {
                                showError(E8, [error.message || GENERIC_RESTART]);
                            }
                        }).submit();
                } else {
                    // For remote projects, we need both the file data and a board name ... so launching a dialog.
                    type ImportBoardModalData = {
                        saveData: { boardName: string, initialData?: BoardData },
                    };
                    let modalData: ImportBoardModalData = reactive(JSON.parse(JSON.stringify({
                        saveData: { boardName: '' },
                    })));

                    let mwVueModals = useVueModals();
                    mwVueModals.createOrUpdateModal({
                        id: IMPORT_BOARD_DIALOG_ID,
                        styleOverrides: {
                            'width': '650px',
                        },
                        layout: {
                            componentName: 'mw-vm-fixed-bottom',
                            panes: {
                                'bottom': {
                                    name: 'eic-savecancel',
                                    componentData: { mwSaveText: 'Import Board' },
                                    eventHandlers: {
                                        'mw-cancel': (event: any) => { mwVueModals.closeModal(IMPORT_BOARD_DIALOG_ID); },
                                        'mw-save':  (event: any) => {
                                            let { boardName, initialData } = modalData.saveData;
                                            new ImportBoardAction(
                                                projectId,
                                                boardName,
                                                JSON.parse(JSON.stringify(initialData)),
                                            ).onSuccess(resp => {
                                                mwVueModals.closeModal(IMPORT_BOARD_DIALOG_ID);
                                            }).onError(error => {
                                                showError(E10, [error.message || GENERIC_RESTART]);
                                            }).submit();
                                        },
                                    }
                                },
                                'main': {
                                    componentName: 'eic-import-board-dialog',
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
                }
            },
            openBoard: (projectId: string, boardId: string) => {
                store.dispatch('setCurrentProjectBoard', { projectId, boardId });
            },
            leaveRemoteProject: (projectId: string) => {
                let remoteProject = store.getters.getRemoteProjectById(projectId);
                if (remoteProject) {
                    new LeaveProjectAction(JSON.parse(JSON.stringify(remoteProject)), projectId)
                        .onError(error => showError(E11, [error.message || GENERIC_RESTART]))
                        .submit();
                } else {
                    // TODO-const : shouldn't ever come up ... throw an error if it does..? or ignore?
                    console.error("Unexpected error when leaving a remote project.");
                }
            },
            retryRemoteProject: (remote: RemoteProject) => {
                new GetProjectDataAction(
                    JSON.parse(JSON.stringify(remote))
                ).onError((err) => {
                    showError(E1, [err.message || GENERIC_RESTART]);
                }).submit();
            },
            addRemoteProject: () => {
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
                    id: ADD_PROJECT_DIALOG_ID,
                    styleOverrides: {
                        'width': '550px',
                    },
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
                                    'mw-cancel':  (event: any) => { useVueModals().closeModal(ADD_PROJECT_DIALOG_ID); },
                                    'mw-save':  (event: any) => {
                                        let { projectUrl, registrationKey, clientName } = modalData.saveData;
                                        // Submit request to server.
                                        new JoinProjectAction(projectUrl, registrationKey, clientName)
                                            .onSuccess(resp => useVueModals().closeModal(ADD_PROJECT_DIALOG_ID))
                                            .onError(error => showError(E9, [error.message || GENERIC_RESTART]))
                                            .submit();
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

        &.mw-connection-error {
            border: 2px solid vars.$red4;
            p { display: inline-block; }
        }

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

        .mw-button-group {
            text-align: right;
            button { margin: 0 5px; }
        }

        .mw-board-blocks {
            display: flex;
            flex-wrap: wrap;
            margin: 24px;
            gap: 20px;
            .mw-board-block {
                @include mixins.lift-up(5px);
                background: vars.$gray0;
                border-radius: vars.$radius-small;
                border: 2px solid vars.$pink-medium;
                padding: 32px 48px;
                cursor: pointer;
                position: relative;

                &:hover {
                    .mw-svg-pencil, .mw-svg-deletionx { opacity: 1; }
                }

                .mw-svg-pencil {
                    transition: opacity 0.2s;
                    position: absolute;
                    top: 5px;
                    left: 5px;
                    opacity: 0;
                }
                .mw-svg-deletionx {
                    transition: opacity 0.2s;
                    position: absolute;
                    top: -12px;
                    right: -12px;
                    opacity: 0;
                }

                input[type=text] {
                    background: vars.$gray1;
                    color: vars.$gray-very-light;
                    border: none;
                    padding: 8px 12px;
                    border-radius: vars.$component-radius;
                    font-size: 16px;
                    &:focus { outline: 1px solid vars.$gray3; }
                }
            }
        }
    }
}

</style>
