<template>
    <div class="mw-leave-project">
        <p>Are you sure you want to leave this project?</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
    },
    setup(props) {
        return {};
    },
});
</script>

<style lang="css">

.mw-leave-project {
    background: var(--gray-very-dark);
    border-radius: var(--dialog-section-radius);
    padding: 10px 20px;
}

</style>
