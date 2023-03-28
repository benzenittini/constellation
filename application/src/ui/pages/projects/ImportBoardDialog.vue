<template>
    <div class="mw-web-projects-importboarddialog">
        <!-- File Name -->
        <div class="mwe-config-section">
            <h3>File to Import:</h3>
            <p class="mw-file-picker" v-bind:class="{ 'mw-warning-text': filepath === '' }" v-on:click="chooseFileLocation()">{{ filepath !== '' ? filepath : 'Click to choose a location.' }}</p>
        </div>

        <!-- Board Name -->
        <div class="mwe-config-section">
            <h3>Board Name:</h3>
            <eic-textbox v-model="saveData.boardName"></eic-textbox>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from "vue";
import { GENERIC_RESTART, ReadFileAsBoardResponse } from "../../../../../common/DataTypes/ActionDataTypes";

import { BoardData } from "../../../../../common/DataTypes/BoardDataTypes";
import { E40, showError } from "../../../common/ErrorLogger";

export default defineComponent({
    props: {
        saveData: Object as PropType<{
            boardName: string,
            initialData?: BoardData
        }>,
    },
    setup(props) {

        let filepath = ref('');

        function chooseFileLocation() {
            (window as any).config.readFileAsBoard().then((resp: ReadFileAsBoardResponse) => {
                if ('errorCode' in resp) {
                    if (resp.errorCode === 3) {
                        // Error code 3 indicates user closed window without choosing file.
                        // No need to display any problems.
                    } else {
                        showError(E40, [resp.message || GENERIC_RESTART]);
                    }

                } else {
                    filepath.value = resp.filepath;
                    if (props.saveData!.boardName === '') {
                        props.saveData!.boardName = resp.filename;
                    }
                    props.saveData!.initialData = resp.boardData;
                }
            });
        }


        // =============
        // Return Values
        // -------------

        return {
            filepath,
            chooseFileLocation,
        };
    }
})
</script>

<style lang="scss">
@use "../../styles/variables" as vars;
@use "../../styles/mixins";

.mw-web-projects-importboarddialog {
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