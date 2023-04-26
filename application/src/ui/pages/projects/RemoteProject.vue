<template>
    <div class="mw-remote-project">
        <!-- Could not connect -->
        <div class="mw-heading-flex mw-connection-error" v-if="!remote.projectId || !projectData">
            <p>Could not connect to <span style="font-weight: bold">{{ remote.remoteProject.serverUrl }}</span></p>
            <div class="mw-button-group">
                <button class="tertiary yellow" v-on:click="leaveRemoteProject(remote.remoteProject, remote.projectId)">Leave Project</button>
                <button class="primary yellow" v-on:click="retryRemoteProject(remote.remoteProject)">Retry Connection</button>
            </div>
        </div>

        <!-- Project w/ boards -->
        <div v-else>
            <div class="mw-heading-flex">
                <h3>{{ projectData.projectName }}<span v-if="remote.version" class="mw-project-version"> (v{{ remote.version }})</span></h3>
                <div class="mw-button-group">
                    <button class="tertiary yellow" v-on:click="leaveRemoteProject(remote.remoteProject, remote.projectId)">Leave Project</button>
                    <button class="tertiary green" v-on:click="importBoard(remote.projectId!)">Import Board</button>
                    <button class="primary green" v-on:click="createBoard(remote.projectId!)">Create Board</button>
                </div>
            </div>
            <div class="mw-board-blocks">
                <div class="mw-board-block" v-for="board in Object.values(projectData.boards)"
                    v-bind:key="board.boardId"
                    v-on:click="boardBeingEdited.boardId !== board.boardId && openBoard(remote.projectId!, board.boardId)">
                    <span v-if="boardBeingEdited.boardId !== board.boardId">{{ board.boardName }}</span>
                    <input v-else type="text"
                        :ref="el => { if (el) editNameRefs[board.boardId] = el }"
                        v-bind:value="board.boardName"
                        v-on:blur="endEditBoard(board.boardName, $event)"
                        v-on:keydown="blurIfEnter($event)"/>
                    <eic-svg-pencil width="20px"
                        v-on:click.stop="beginEditBoard(remote.projectId!, board.boardId)"></eic-svg-pencil>
                    <eic-svg-deletion-x class="inversion" width="25px"
                        v-on:click.stop="deleteBoard(remote.projectId!, board.boardId)"
                        ></eic-svg-deletion-x>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onBeforeUpdate, PropType } from 'vue';
import { useVueModals } from 'mw-vue-modals';

import { RemoteProject, GENERIC_RESTART, TypedMap, RemoteProjectLookup, BasicProjectData } from 'constellation-common/datatypes';
import { E1, E11, E35, E7, showError } from '../../ErrorLogger';

import { GetProjectDataAction } from '../../actions/project-actions/GetProjectData';
import { LeaveProjectAction } from '../../actions/project-actions/LeaveProject';
import { UpdateBoardConfigAction } from '../../actions/project-actions/UpdateBoardConfig';
import { useBoardOperations } from '../../composables/BoardOperations';

export default defineComponent({
    props: {
        remote: {
            type: Object as PropType<RemoteProjectLookup>,
            required: true,
        },
        projectData: Object as PropType<BasicProjectData>,
    },
    setup(props) {
        const boardOps = useBoardOperations();

        const LEAVE_PROJECT_DIALOG_ID = 'leave-project-dialog';

        let boardBeingEdited: Ref<{projectId?: string, boardId?: string}> = ref({projectId: undefined, boardId: undefined});
        // (see: https://v3.vuejs.org/guide/composition-api-template-refs.html#usage-inside-v-for)
        let editNameRefs: Ref<TypedMap<any>> = ref({}); // TypedMap<classificationElements>
        onBeforeUpdate(() => editNameRefs.value = {});

        return {
            ...boardOps,

            boardBeingEdited,
            editNameRefs,

            beginEditBoard: (projectId: string, boardId: string) => {
                boardBeingEdited.value = { projectId, boardId };
                setTimeout(() => (editNameRefs.value as any)[boardId].select(), 0);
            },
            blurIfEnter: (event: KeyboardEvent) => {
                if (event.key === 'Enter' && boardBeingEdited.value.boardId) {
                    (editNameRefs.value as any)[boardBeingEdited.value.boardId].blur();
                }
            },
            endEditBoard: (currentName: string, event: FocusEvent) => {
                const newName = (event.target as HTMLInputElement).value;
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
                } else {
                    boardBeingEdited.value = {};
                }

            },

            leaveRemoteProject: (remoteProject: RemoteProject, projectId?: string) => {
                if (remoteProject) {
                    const mwVueModals = useVueModals();
                    mwVueModals.createOrUpdateModal({
                        id: LEAVE_PROJECT_DIALOG_ID,
                        styleOverrides: {},
                        layout: {
                            componentName: 'mw-vm-fixed-bottom',
                            panes: {
                                'bottom': {
                                    componentName: 'eic-savecancel',
                                    componentData: { mwSaveText: 'Yes' },
                                    eventHandlers: {
                                        'mw-cancel':  (event: any) => { mwVueModals.closeModal(LEAVE_PROJECT_DIALOG_ID); },
                                        'mw-save':  (event: any) => {
                                            new LeaveProjectAction(JSON.parse(JSON.stringify(remoteProject)), projectId)
                                                .onError(error => showError(E11, [error.message || GENERIC_RESTART]))
                                                .submit();
                                            mwVueModals.closeModal(LEAVE_PROJECT_DIALOG_ID);
                                        },
                                    }
                                },
                                'main': {
                                    componentName: 'eic-leave-project-dialog',
                                    styleOverrides: {},
                                    eventHandlers: {}
                                }
                            }
                        }
                    });
                } else {
                    showError(E35, [GENERIC_RESTART]);
                }
            },
            retryRemoteProject: (remote: RemoteProject) => {
                new GetProjectDataAction(
                    JSON.parse(JSON.stringify(remote))
                ).onError((err) => {
                    showError(E1, [err.message || GENERIC_RESTART]);
                }).submit();
            },
        };
    },
});
</script>

<style lang="scss">

@use "../../styles/variables" as vars;
@use "./styles";

.mw-remote-project {
    .mw-connection-error {
        p { margin: 0 8px; color: vars.$red-error; }
    }
    .mw-project-version {
        color: vars.$gray4;
    }
}

</style>
