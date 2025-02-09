<template>
    <div class="mw-app-wsconnectiondialog">
        <h2>{{ mwMessage }}</h2>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        mwMessage: String
    },
    setup() {
        return {
        }
    }
})
</script>

<style lang="css">

.mw-app-wsconnectiondialog {
    background: var(--gray-very-dark);
    border-radius: var(--dialog-section-radius);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

</style>
