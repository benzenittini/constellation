<template>
    <div class="mw-web-projects-createboarddialog">
        <!-- File Name -->
        <div class="mwe-config-section" v-if="projectId === LOCAL_PROJECT">
            <h3>Save File:</h3>
            <p class="mw-file-picker" v-bind:class="{ 'mw-warning-text': saveData.fileName === '' }" v-on:click="chooseFileLocation()">{{ saveData.fileName !== '' ? saveData.fileName : 'Click to choose a location.' }}</p>
        </div>

        <!-- Board Name -->
        <div class="mwe-config-section" v-else>
            <h3>Board Name:</h3>
            <eic-textbox ref="boardNameTextbox" v-model="saveData.boardName"></eic-textbox>
        </div>

        <!-- Template Dropdown -->
        <div class="mwe-config-section">
            <h3>Base Template:</h3>
            <eic-dropdown v-bind:eic-options="templateOptions" v-model="templateSelection"></eic-dropdown>
            <button class="secondary gray"
                v-on:click="showTemplateConfig = !showTemplateConfig"
                >{{ showTemplateConfig ? 'Hide' : 'Show' }} Template Config</button>
        </div>

        <div class="mwe-template-config" v-show="showTemplateConfig">
            <p>Select the classifications you want your board to start with. Once the board is created, you can fine-tune their fields to better meet your needs.</p>
            <!-- Top-level tree -->
            <div class="mwe-template-tree">
                <eic-expandable-tree
                    v-for="(project,projIndex) in classificationTree" v-bind:key="project.projectId"
                    v-bind:start-expanded="true">
                    <template v-slot:title><span class="mwm-helper-text" v-if="projIndex !== 0">Project: </span>{{ project.projectName }}</template>
                    <template v-slot:content>
                        <!-- Second-level tree -->
                        <eic-expandable-tree v-for="board in project.boards" v-bind:key="board.boardId">
                            <template v-slot:title><span class="mwm-helper-text" v-if="projIndex !== 0">Board: </span>{{ board.boardName }}</template>
                            <template v-slot:content>
                                <!-- Classification rows -->
                                <div class="mwe-classification-option" v-for="cid in board.classificationIds" v-bind:key="cid">
                                    <eic-checkbox
                                        v-model="chosenClassifications[cid]"
                                        v-bind:eic-label="classificationLookup[cid].name"
                                        v-on:eic-val-set="templateSelection = CUSTOM"
                                        ></eic-checkbox>
                                    <p class="mwe-field-list"
                                        v-bind:title="`The list of fields the '${classificationLookup[cid].name}' classification adds.`"
                                        v-bind:class="{ 'mwm-selected': chosenClassifications[cid] }"
                                        >{{ classificationLookup[cid].fields.map(f => f.name).join(', ') }}</p>
                                </div>
                            </template>
                        </eic-expandable-tree>
                    </template>
                </eic-expandable-tree>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, Ref, ref, watch } from "vue";
import { v4 as uuidv4 } from 'uuid';

import { useStore } from "../../store/store";
import { BUILT_IN_TEMPLATES } from "../../store/Types/FieldStoreTypes";
import { TypedMap } from "../../../../../common/DataTypes/GenericDataTypes";
import { BoardTemplateClient, LOCAL_PROJECT, TemplateClassification } from "../../../../../common/DataTypes/BoardDataTypes";
import { GetBoardTemplatesAction } from '../../actions/project-actions/GetBoardTemplates';
import { E3, GENERIC_RESTART, showError } from "../../../common/ErrorLogger";

export default defineComponent({
    props: {
        projectId: String,
        saveData: Object,
    },
    setup(props) {

        const store = useStore();

        function chooseFileLocation() {
            (window as any).config.getPathForNewBoard().then((path: string | undefined) => {
                if (path) props.saveData!.fileName = path;
            });
        }

        // =================================================
        // Auto-select the "board name" textbox when opened.
        // -------------------------------------------------

        let boardNameTextbox = ref(null);
        onMounted(() => {
            if (props.projectId !== LOCAL_PROJECT) {
                (boardNameTextbox.value as any).$el.getElementsByTagName('input')[0].focus();
            }
        });


        // ====================================
        // Create data structure for "the tree"
        // ------------------------------------

        type ClassificationTree = {
            projectId: string,
            projectName: string,
            boards: {
                boardId: string,
                boardName: string,
                classificationIds: string[],
            }[],
        }[];

        /** Helper function used to "unfold" the provided template INTO the provided lookup and tree parameters. */
        function processTemplate(template: BoardTemplateClient, lookup: TypedMap<TemplateClassification>, tree: ClassificationTree) {
            // Look up or create the project in our tree
            let projectId = template.projectId;
            let projectName = template.projectName;
            let project = tree.find(p => p.projectId === projectId);
            if (!project) {
                project = { projectId, projectName, boards: [] };
                tree.push(project);
            }

            // Look up or create the board in our tree
            let boardId = template.boardId;
            let boardName = template.boardName;
            let board = project.boards.find(b => b.boardId === boardId);
            if (!board) {
                board = { boardId, boardName, classificationIds: [] };
                project.boards.push(board);
            }

            // Flatten the classifications, and generate/record a unique ID for each.
            template.classifications.forEach(c => {
                let id = uuidv4();
                board!.classificationIds.push(id);
                lookup[id] = c;
            });
        }

        // Flatten all available classifications into one lookup object keyed by freshly-generated IDs.
        // While we're at it, build up the tree connecting these classification IDs to their projects/boards.
        let classificationLookup: TypedMap<TemplateClassification> = reactive({});
        let classificationTree: ClassificationTree = [];
        BUILT_IN_TEMPLATES.forEach(temp => processTemplate(temp, classificationLookup, classificationTree));


        // ======================================
        // Get a list of all the user's templates
        // --------------------------------------

        let userTemplates: Ref<BoardTemplateClient[]> = ref([]);

        // Add local templates
        new GetBoardTemplatesAction()
            .onSuccess<BoardTemplateClient[]>(templates => {
                userTemplates.value.push(...templates);
                templates.forEach(temp => processTemplate(temp, classificationLookup, classificationTree));
            }).submit();

        // Add remote templates
        Object.values(store.state.generalData.remoteProjectLookup).forEach(remote => {
            new GetBoardTemplatesAction(remote.remoteProject)
                .onSuccess<BoardTemplateClient[]>(templates => {
                    userTemplates.value.push(...templates);
                    templates.forEach(temp => processTemplate(temp, classificationLookup, classificationTree));
                }).onError((error) => {
                    if (typeof error.message === 'string') {
                        showError(E3, [error.message || GENERIC_RESTART]);
                    } else {
                        // Intentionally swallowing axios errors.
                    }
                }).submit();
        });


        // ===================================
        // Populate the template dropdown menu
        // -----------------------------------

        let showTemplateConfig = ref(false);

        const SCRATCH = "Scratch";
        const CUSTOM = "Custom";
        let templateOptions = computed(() => {
            // Built-In Templates
            let templates: {display: string, value?: string, disabled?: boolean, group?: string}[] = BUILT_IN_TEMPLATES.map(template => ({
                display: template.boardName,
                value: template.boardId,
                group: "Built-In"
            }));

            // User-Defined Templates
            const YOUR_BOARDS = "Your Boards";
            if (userTemplates.value.length === 0) {
                templates.push({ display: "(none)", disabled: true, group: YOUR_BOARDS});
            } else {
                userTemplates.value.forEach(temp => {
                    templates.push({
                        display: `${temp.projectName} / ${temp.boardName}`,
                        value: temp.boardId,
                        group: YOUR_BOARDS
                    });
                });
            }

            // Miscellaneous Options
            templates.push({ display: "Start from Scratch", value: SCRATCH, group: "Other" });
            templates.push({ display: "Custom",             value: CUSTOM,  group: "Other" });

            return templates;
        });


        // ==========================================
        // Track the user's classification selections
        // ------------------------------------------

        // Track user-selected classifications as a map of "classification" IDs to true/false
        let chosenClassifications: TypedMap<boolean> = reactive(
            Object.keys(classificationLookup).reduce((acc, cid) => {
                acc[cid] = false;
                return acc;
            }, ({} as TypedMap<boolean>)));
        watch(() => Object.keys(classificationLookup), (newVal) => {
            newVal.forEach(cid => {
                if (chosenClassifications[cid] === undefined) {
                    chosenClassifications[cid] = false;
                }
            });
        });

        // Return the result through the "saveData" prop
        props.saveData!.classifications = computed(() => {
            // Collapse into a list of classificationIds
            let chosenIds = [];
            for (let id in chosenClassifications) {
                if (chosenClassifications[id]) chosenIds.push(id);
            }
            // Populate by replacing the IDs with the classification definitions
            return chosenIds.map(id => classificationLookup[id]);
        });


        // =======================================
        // Update Checkboxes when Dropdown Changes
        // ---------------------------------------

        function getClassificationsForBoard(boardId: string): string[] {
            for (let project of classificationTree) {
                for (let board of project.boards) {
                    if (board.boardId === boardId) {
                        return board.classificationIds;
                    }
                }
            }
            return [];
        }
        let templateSelection = ref(SCRATCH);
        watch(templateSelection, (newValue) => {
            if (newValue === SCRATCH) {
                // Clear all selected classifications
                for (let id in chosenClassifications) {
                    chosenClassifications[id] = false;
                }
            } else if (newValue === CUSTOM) {
                // No-op
            } else {
                // Activate all classifications for the chosen board, and clear all others.
                let classificationList = getClassificationsForBoard(newValue);
                for (let id in chosenClassifications) {
                    chosenClassifications[id] = classificationList.includes(id);
                }
            }
        });


        // =============
        // Return Values
        // -------------

        return {
            LOCAL_PROJECT,

            chooseFileLocation,

            // Form Components
            boardNameTextbox,

            // Template Dropdown
            CUSTOM,
            templateOptions,
            templateSelection,
            showTemplateConfig,

            // Template Config (tree)
            classificationTree,
            chosenClassifications,
            classificationLookup,
        };
    }
})
</script>

<style lang="scss">
@use "../../styles/variables" as vars;
@use "../../styles/mixins";

.mw-web-projects-createboarddialog {
    background: vars.$gray-very-dark;
    border-radius: vars.$dialog-section-radius;
    padding: 10px 20px;

    h3                { color: vars.$gray4; padding: 0; }
    button            { font-size: 14px; padding: 6px 12px !important; }

    .mw-file-picker {
        cursor: pointer;
        &.mw-warning-text {
            color: vars.$red-error;
        }
    }

    .mwe-config-section {
        &>* {
            display: inline-block;
            margin: 10px;
        }
        .mw-dropdown { max-width: 230px; }
    }
    .mwe-template-config {
        p {
            color: vars.$gray4;
            padding: 0 40px;
        }
        .mwe-template-tree {
            @include mixins.scrollbars();

            height: 230px;
            margin: 20px;
            overflow-y: auto;
            padding: 10px;
            padding-left: 30px;
            background: vars.$gray1;
            border-radius: vars.$radius-small;

            &>.mw-expandable-tree {
                margin: 10px 0;
                .mw-expandable-tree {
                    margin: 5px 0;
                }
            }

            .mwm-helper-text {
                color: vars.$gray4;
            }

            .mwe-classification-option {
                display: flex;
                justify-content: space-between;
                gap: 18px;
                &>* {
                    &:first-child { flex-grow: 1; flex-shrink: 0; }
                    &:last-child  {
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        overflow: hidden;
                        margin: 1px;
                    }
                }

                .mwe-field-list { color: vars.$gray4; }
                .mwm-selected   { color: vars.$gray8; }
            }
        }

    }
}

</style>