<template>
    <div class="mw-delete-board">
        <p>Are you sure you want to delete this board?</p>
        <eic-checkbox v-if="isLocalBoard" v-model="saveData.deleteFile" eic-label="Also delete file on filesystem?"></eic-checkbox>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

import { LOCAL_PROJECT } from '../../../../../common/DataTypes/BoardDataTypes';

export default defineComponent({
    props: {
        saveData: Object as PropType<{
            projectId: string,
            boardId: string,
            deleteFile?: boolean,
        }>,
    },
    setup(props) {
        return {
            isLocalBoard: props.saveData?.projectId === LOCAL_PROJECT,
        };
    },
});
</script>

<style lang="scss">

@use "../../styles/variables" as vars;

.mw-delete-board {
    background: vars.$gray-very-dark;
    border-radius: vars.$dialog-section-radius;
    padding: 10px 20px;

    .mw-checkbox {
        margin: 20px;
        margin-bottom: 10px;
    }
}

</style>
