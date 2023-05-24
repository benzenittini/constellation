<template>
    <div class="mw-app-relationship-textcontent">
        <textarea v-if="inEditMode"
            ref="textareaRef"
            data-test="edit-textarea"
            v-model="editText"
            v-bind:style="textStyle"
            v-on:keydown="checkForEditCompletion"
            v-on:blur="completeEdit(true)"
            ></textarea>
        <pre v-bind:style="textStyle" v-else>{{ blockData.text }}</pre>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";

import { useEmitter } from "../../composables/Emitter";

export default defineComponent({
    emits: [
        // Emits the same datashape expected for this type of block content. (Ex: An "BlockContent" implementation.)
        // TextContentType: { type: 'text', data: { text: 'hello, world!' }}
        'editcomplete'
    ],
    props: {
        blockData: {
            type: Object,
            required: true,
        },
        blockStyle: Object,
        inEditMode: Boolean
    },
    setup(props, context) {
        const emitter = useEmitter();

        let editText = ref(props.blockData!.text);
        let textareaRef = ref(null);

        let textStyle = computed(() => {
            return {
                color: props.blockStyle?.color
            };
        });

        // If someone else changes blockData, and we receive the change over websockets, we need to update
        // the text our textarea is based on. Otherwise, it'll be using the original text.
        watch(() => props.blockData!.text, (newValue, oldValue) => {
            editText.value = newValue;
        });

        let savedEdit = ref(true);
        let focusTextArea = (inEditMode: boolean | undefined) => {
            // Because of the 'v-if', vue needs an opportunity to render the textareaRef, hence the setTimeout(0)
            setTimeout(() => {
                if (inEditMode && textareaRef.value !== null) {
                    // I couldn't get typescript to shut up about textareaRef.value possibly being null, even with
                    // the null check. I'm guessing it has to do with it seeing us set it to "null" above, but not
                    // seeing vue set it to a different value using vue-magic. Cast to "any" is to make typescript
                    // be quiet.
                    (textareaRef.value as any).focus();
                    savedEdit.value = false;
                }
            }, 0);
        };
        watch(() => props.inEditMode, (newValue, oldValue) => { focusTextArea(newValue); });
        // When creating a new block, the above "watch" doesn't get triggered but props.inEditMode is true, so we
        // need to call this "focus" function to account for this scenario.
        focusTextArea(props.inEditMode);

        function completeEdit(cancelled: boolean) {
            if (!savedEdit.value) { // Prevents a double-trigger on blur.
                savedEdit.value = true;
                context.emit('editcomplete', {
                    cancelled,
                    editEvent: {
                        type: 'text',
                        data: {
                            text: editText.value
                        }
                    }
                });
            }
        }

        return {
            editText,
            textareaRef,
            textStyle,

            completeEdit,

            checkForEditCompletion: (event: KeyboardEvent) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    // If the user pressed "Enter" (without "shift"), then complete the edit
                    event.preventDefault();
                    completeEdit(false);
                } else if (event.key === 'Escape') {
                    // If the user pressed "Escape", then complete the edit
                    event.preventDefault();
                    completeEdit(true);
                }
            }
        }
    },
})
</script>

<style lang="scss">

@use '../../styles/variables' as vars;

.mw-app-relationship-textcontent {
    height: 100%;

    textarea {
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        resize: none;
        color: vars.$gray-very-light;
        text-align: center;
        margin: 0;
        padding: 0;
        overflow: hidden;
    }
}

// This centers the displayed contents:
.mw-app-relationship-textcontent {
    position: relative;
    pre {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);

        text-align: center;
        margin: 0;
        padding: 0;

        width: 100%;
        white-space: pre-line;
    }
}
</style>