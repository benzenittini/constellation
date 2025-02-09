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
import { defineComponent, PropType, ref } from "vue";
import { GENERIC_RESTART, ReadFileAsBoardResponse, BoardData } from 'constellation-common/datatypes';

import { E40, showError } from "../../ErrorLogger";

export default defineComponent({
    props: {
        saveData: {
            type: Object as PropType<{
                boardName: string,
                initialData?: BoardData
            }>,
            required: true,
        },
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

<style lang="css">

.mw-web-projects-importboarddialog {
    background:    var(--gray-very-dark);
    border-radius: var(--dialog-section-radius);
    padding: 10px 20px;

    h3     { color: var(--gray4); padding: 0; }
    button { font-size: 14px; padding: 6px 12px !important; }

    .mw-file-picker {
        cursor: pointer;
        &.mw-warning-text {
            color: var(--red-error);
        }
    }

    .mwe-config-section {
        &>* {
            display: inline-block;
            margin: 10px;
        }
        .mw-dropdown { max-width: 230px; }
    }
}

</style>