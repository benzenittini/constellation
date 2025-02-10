<template>
    <div class="mw-delete-board">
        <p>Are you sure you want to delete this board?</p>
        <eic-checkbox v-if="isLocalBoard" v-model="saveData.deleteFile" eic-label="Also delete file on filesystem?"></eic-checkbox>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { LOCAL_PROJECT } from 'constellation-common/datatypes';

export default defineComponent({
    props: {
        saveData: {
            type: Object as PropType<{
                projectId: string,
                boardId: string,
                deleteFile?: boolean,
            }>,
            required: true,
        },
    },
    setup(props) {
        return {
            isLocalBoard: props.saveData?.projectId === LOCAL_PROJECT,
        };
    },
});
</script>

<style>

.mw-delete-board {
    background: var(--gray-very-dark);
    border-radius: var(--dialog-section-radius);
    padding: 10px 20px;

    .mw-checkbox {
        margin: 20px;
        margin-bottom: 10px;
    }
}

</style>
