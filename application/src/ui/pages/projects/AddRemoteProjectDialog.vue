<template>
    <div class="mw-add-remote-project">
        <h3>Server URL:</h3>
        <eic-textbox ref="urlRef" v-model="saveData.projectUrl" eic-placeholder="ex: https://localhost:3000"></eic-textbox>
        <h3>Registration Key:</h3>
        <eic-textbox v-model="saveData.registrationKey" eic-placeholder="ex: 51b51563-ebaf-433c-8864-37a63a15668d"></eic-textbox>
        <h3>Client Label:</h3>
        <eic-textbox v-model="saveData.clientName" eic-placeholder="ex: Ben's 2019 Sys76"></eic-textbox>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue';

export default defineComponent({
    props: {
        saveData: Object as PropType<{
            projectUrl: string,
            registrationKey: string,
            clientName: string,
        }>,
    },
    setup() {

        const urlRef = ref(null);
        onMounted(() => {
            (urlRef as any).value.$el.getElementsByTagName('input')[0].focus();
        });

        return {
            urlRef,
        };
    },
});
</script>

<style lang="scss">

@use "../../styles/variables" as vars;

.mw-add-remote-project {
    background: vars.$gray-very-dark;
    border-radius: vars.$dialog-section-radius;
    padding: 10px 20px;

    h3 { color: vars.$gray4; padding: 0; }

    display: grid;
    grid-template-columns: 140px 1fr;
    column-gap: 10px;
    &>* {
        align-self: center;
    }
}

</style>
