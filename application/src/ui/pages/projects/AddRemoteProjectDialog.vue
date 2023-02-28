<template>
    <div class="mw-add-remote-project">
        <eic-textbox v-model="saveData.projectUrl"      eic-placeholder="ex: https://localhost:3000"></eic-textbox>
        <eic-textbox v-model="saveData.registrationKey" eic-placeholder="ex: 51b51563-ebaf-433c-8864-37a63a15668d"></eic-textbox>
        <eic-textbox v-model="saveData.clientName"      eic-placeholder="ex: Ben's 2019 Sys76"></eic-textbox>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    props: {
        saveData: Object as PropType<{
            projectUrl: string,
            registrationKey: string,
            clientName: string,
        }>,
    },
    setup() {
        return {
        };
    },
});
</script>

<style lang="scss">

@use "../../styles/variables" as vars;

.mw-add-remote-project {
}

</style>
