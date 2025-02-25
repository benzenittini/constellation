<template>
    <div class="mw-add-remote-project">
        <h3>Server URL:</h3>
        <eic-textbox ref="urlRef" v-model="saveData.projectUrl" eic-placeholder="ex: https://localhost:3000"></eic-textbox>
        <h3>Registration Key:</h3>
        <eic-textbox v-model="saveData.registrationKey" eic-placeholder="ex: 51b51563-ebaf-433c-8864-37a63a15668d"></eic-textbox>
        <h3>Computer Name:</h3>
        <eic-textbox v-model="saveData.clientName" eic-placeholder="ex: Ben's 2019 Sys76"></eic-textbox>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, PropType, ref } from 'vue';

export default defineComponent({
    props: {
        saveData: {
            type: Object as PropType<{
                projectUrl: string,
                registrationKey: string,
                clientName: string,
            }>,
            required: true
        }
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

<style>

.mw-add-remote-project {
    background: var(--gray-very-dark);
    border-radius: var(--dialog-section-radius);
    padding: 10px 20px;

    display: grid;
    grid-template-columns: 150px 1fr;
    column-gap: 10px;
    &>* { align-self: center; }

    h3 { color: var(--gray4); padding: 0; }

}

</style>
