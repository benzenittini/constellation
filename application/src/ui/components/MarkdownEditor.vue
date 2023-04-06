<template>
    <div class="mw-markdowneditor">
        <div v-if="mwEditorTitle !== ''" class="title-with-tabs">
            <div class="title">{{ mwEditorTitle }}</div>
            <div class="tab" v-bind:class="{selected: !isEditMode}" v-on:click="exitEditMode">Read</div>
            <div class="tab" v-bind:class="{selected: isEditMode}" v-on:click="enterEditMode" v-if="!mwDisabled">Edit</div>
        </div>
        <div v-else>
            <div class="tab" v-bind:class="{selected: !isEditMode}" v-on:click="exitEditMode">Read</div>
            <div class="tab" v-bind:class="{selected: isEditMode}" v-on:click="enterEditMode" v-if="!mwDisabled">Edit</div>
        </div>
        <div class="content">
            <textarea ref="textareaRef"
                placeholder="(This supports Markdown &#x1F389;)"
                v-bind:rows="eicVisibleTextareaRows"
                v-show="isEditMode"
                v-model="inputVal"
                v-on:blur="$emit('eic-blur'); $emit('eic-val-set', $event.target.value);"></textarea>
            <div v-show="!isEditMode && displayHtml.length === 0" class="mwe-formatted-content mwm-no-content">(no value)</div>
            <div v-show="!isEditMode && displayHtml.length > 0"   class="mwe-formatted-content" v-html="displayHtml"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

export default defineComponent({
    props: {
        modelValue: { // Must be "modelValue" for v-model to work
            type: String,
            default: ""
        },
        mwEditorTitle: {
            type: String,
            default: ""
        },
        eicVisibleTextareaRows: {
            type: Number,
            default: 10
        },
        mwDisabled: {
            type: Boolean,
            default: false
        },
    },
    setup(props, context) {
        let textareaRef = ref(null);

        let inputVal = computed({
            get: () => props.modelValue,
            set: val => { context.emit('update:modelValue', val)}
        });

        let displayHtml = computed(() => {
            return DOMPurify.sanitize(marked(inputVal.value!, {
                highlight: (code, lang) => {
                    const validLanguage = hljs.getLanguage(lang) ? lang : 'plaintext';
                    return hljs.highlight(code, { language: validLanguage }).value;
                }
            }));
        });

        let isEditMode = ref(false);

        return {
            textareaRef,
            inputVal,
            displayHtml,
            isEditMode,
            eicVisibleTextareaRows: props.eicVisibleTextareaRows,
            exitEditMode: () => {
                isEditMode.value = false;
                context.emit('mw-exit-edit-mode');
            },
            enterEditMode: () => {
                isEditMode.value = true;
                // Because of the 'v-if', vue needs an opportunity to render the textareaRef, hence the setTimeout(0)
                setTimeout(() => {
                    if (textareaRef.value !== null) {
                        (textareaRef.value as any).focus();
                    }
                }, 0);
                context.emit('mw-enter-edit-mode');
            },
        }
    }
})
</script>

<style lang="scss">
@use "../styles/variables" as vars;
@use "highlight.js/scss/atom-one-dark";

.mw-markdowneditor {
    color: vars.$gray-very-light;

    h1,h2,h3,h4,h5,h6,p,li,a { text-align: left !important; }

    .title-with-tabs {
        display: flex;
        .title  { flex-grow: 1; }
        div:not(.title) { flex-grow: 0; }
    }

    .tab {
        position: relative;
        background: vars.$gray0;
        border-radius: vars.$component-radius vars.$component-radius 0 0;
        text-align: center;
        min-width: 100px;
        padding: 8px 0;
        display: inline-block;
        cursor: pointer;
        color: vars.$gray4;
        z-index: 1;

        $border-width: 2px;
        border: $border-width solid vars.$gray1;

        transform: translateY($border-width);
        &:not(:first-child) {
            transform: translate(-6px, $border-width);
        }

        &.selected {
            z-index: 2;
            color: vars.$gray-very-light;
            background: vars.$gray1;
            padding: 8px 0;
        }
    }
    .content {
        border-radius: 0 vars.$component-radius vars.$component-radius vars.$component-radius;
        padding: 10px;
        background: vars.$gray1;

        a { color: vars.$pink-medium; }
        a:hover { color: vars.$gray-very-light; }

        .mwe-formatted-content { overflow-x: auto; }
        .mwm-no-content { color: vars.$gray4; }
    }

    textarea {
        font-family: 'Courier New', Courier, monospace;
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        outline: none;
        resize: none;
        color: vars.$gray-very-light;
    }

    pre {
        padding: 10px;
        border-radius: vars.$radius-small;
        background: vars.$gray-very-dark;
        overflow-x: auto;
        width: 100%;
    }

    del {
        color: vars.$gray4;
    }
}
</style>
