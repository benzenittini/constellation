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

<style lang="scss">
@use "../styles/variables" as vars;

.mw-app-wsconnectiondialog {
    background: vars.$gray-very-dark;
    border-radius: vars.$dialog-section-radius;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

</style>
