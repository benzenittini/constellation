<template>
    <div class="mw-keyboardkey">
        <span>{{ mwKeyText }}</span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {
        mwKeyText: String
    },
    setup(props) {
        return {};
    }
})
</script>

<style>

.mw-keyboardkey {
    display: inline-block;
    border-radius: 6px;
    background: var(--gray3);
    letter-spacing: 1px;
    font-size: 1.1em;
    padding: 5px 15px;

    span {
        font-weight: bold;
        color: var(--gray-very-dark);
    }
}

</style>
