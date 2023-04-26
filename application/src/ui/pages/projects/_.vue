<template>
    <div id="mw-projects">
        <!-- Local Boards -->
        <div class="mw-page-section">
            <div class="mw-heading-flex">
                <h2>{{ LOCAL_PROJECT_NAME }}</h2>
                <div class="mw-button-group">
                    <button class="tertiary green" v-on:click="importBoard(LOCAL_PROJECT)">Import Board</button>
                    <button class="primary green" v-on:click="createBoard(LOCAL_PROJECT)">Create Board</button>
                </div>
            </div>
            <eic-local-boards></eic-local-boards>
        </div>

        <!-- Remote Boards -->
        <div class="mw-page-section">
            <div class="mw-heading-flex">
                <h2>Remote Projects</h2>
                <button class="primary pink" v-on:click="addRemoteProject()">Add Remote Project</button>
            </div>

            <div class="mw-remote-projects" v-for="remote in remoteProjects" v-bind:key="remote.projectId">
                <eic-hr></eic-hr>
                <eic-remote-project
                    v-bind:remote="remote"
                    v-bind:projectData="projectMap[remote.projectId!]"
                    ></eic-remote-project>

            </div>
        </div>

        <!-- User Settings -->
        <div class="mw-page-section">
            <h2>User Settings</h2>
            <eic-user-settings></eic-user-settings>
        </div>

        <!-- Version String -->
        <div class="mw-version-string">v{{ appVersion }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, reactive } from 'vue';
import { useVueModals } from 'mw-vue-modals';

import { LOCAL_PROJECT, LOCAL_PROJECT_NAME, GENERIC_RESTART } from 'constellation-common/datatypes';

import { useStore } from '../../store/store';
import { useBoardOperations } from '../../composables/BoardOperations';
import { E9, showError } from '../../ErrorLogger';

import { GetProjectDataAction } from '../../actions/project-actions/GetProjectData';
import { GetRemoteProjectsAction } from '../../actions/project-actions/GetRemoteProjects';
import { JoinProjectAction } from '../../actions/project-actions/JoinProject';

export default defineComponent({
    setup() {
        const store = useStore();
        const boardOps = useBoardOperations();

        const ADD_PROJECT_DIALOG_ID = 'add-remote-project';

        onMounted(() => {
            document.title = "Constellation";

            // Prep the local project/boards
            new GetProjectDataAction().submit();

            // Prep the remote projects/boards
            new GetRemoteProjectsAction().submit();
        });

        return {
            LOCAL_PROJECT, LOCAL_PROJECT_NAME,

            ...boardOps,

            appVersion: store.state.generalData.appVersion,

            remoteProjects: computed(() => store.state.generalData.remoteProjectLookup),
            projectMap: computed(() => store.state.generalData.projectData),

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
                                componentName: 'eic-savecancel',
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
@use "./styles";

#mw-projects {
    width: 100%;
    padding: 32px;

    .mw-page-section {
        background: vars.$gray1;
        margin: 32px;
        padding: 24px 32px;
        border-radius: vars.$radius-medium;

        h2,h3 {
            margin: 0;
            padding: 0;
            display: inline-block;
        }

        .mw-remote-projects {
            margin: 24px;
            h3 { padding-left: 8px; }
        }
    }

    .mw-version-string {
        position: absolute;
        bottom: 10px;
        right: 10px;
        color: vars.$gray-medium;
    }
}

</style>
