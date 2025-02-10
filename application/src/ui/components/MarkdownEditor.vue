<template>
    <div v-bind:class="{ 'mw-markdowneditor': true, 'mw-has-title': mwEditorTitle !== '' }">
        <div class="tabs">
            <div v-if="mwEditorTitle !== ''" class="title">{{ mwEditorTitle }}</div>
            <div class="tab" v-bind:class="{selected: !isEditMode}" v-on:click="exitEditMode">Read</div>
            <div class="tab" v-bind:class="{selected: isEditMode}" v-on:click="enterEditMode" v-if="!mwDisabled">Edit</div>
        </div>
        <div class="content">
            <textarea ref="textareaRef"
                class="mw-scrollbars"
                placeholder="(This supports Markdown &#x1F389;)"
                v-bind:rows="eicVisibleTextareaRows"
                v-show="isEditMode"
                v-model="inputVal"
                v-on:blur="$emit('eic-blur'); $emit('eic-val-set', ($event.target as HTMLInputElement).value);"></textarea>
            <div v-show="!isEditMode && displayHtml.length === 0" class="mwe-formatted-content mwm-no-content">(no value)</div>
            <div v-show="!isEditMode && displayHtml.length > 0"   class="mwe-formatted-content mw-scrollbars" v-html="displayHtml"></div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from "vue";
import { Marked } from 'marked';
import { markedHighlight } from "marked-highlight";
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

        let marked = new Marked(markedHighlight({
            // emptyLangClass: 'hljs',
            // langPrefix: 'hljs language-',
            highlight(code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
        }));

        let displayHtml = computed(() => {
            return DOMPurify.sanitize(marked.parse(inputVal.value) as string);
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

<style>

@import url("highlight.js/styles/atom-one-dark.min.css");

.mw-markdowneditor {
    color: var(--gray-very-light);

    h1,h2,h3,h4,h5,h6,p,li,a { text-align: left !important; }

    &.mw-has-title .tabs {
        display: flex;
        .title  { flex-grow: 1; }
        div:not(.title) { flex-grow: 0; }
    }

    .tab {
        position: relative;
        background: var(--gray0);
        border-radius: var(--component-radius) var(--component-radius) 0 0;
        text-align: center;
        min-width: 100px;
        padding: 8px 0;
        display: inline-block;
        cursor: pointer;
        color: var(--gray4);
        z-index: 1;

        --border-width: 2px;
        border: var(--border-width) solid var(--gray1);

        transform: translateY(var(--border-width));
        &:not(:first-child) {
            transform: translate(-6px, var(--border-width));
        }

        &.selected {
            z-index: 2;
            color: var(--gray-very-light);
            background: var(--gray1);
            padding: 8px 0;
        }
    }
    &.mw-has-title .content {
        border-radius: var(--component-radius);
    }
    .content {
        border-radius: 0 var(--component-radius) var(--component-radius) var(--component-radius);
        padding: 10px;
        background: var(--gray1);

        a { color: var(--pink-medium); }
        a:hover { color: var(--gray-very-light); }

        .mwe-formatted-content { overflow-x: auto; }
        .mwm-no-content { color: var(--gray4); }

        blockquote {
            border-left: 4px solid var(--gray3);
            padding-inline-start: 10px;
            margin-inline-start: 20px;
        }
    }

    textarea {
        font-family: 'Courier New', Courier, monospace;
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        outline: none;
        resize: none;
        color: var(--gray-very-light);
    }

    pre {
        padding: 10px;
        background: var(--gray-very-dark);
        overflow-x: auto;
        width: 100%;
        /* Scrollbars are added to the inner "marked" pre tag inside mixins.css */
    }

    del {
        color: var(--gray4);
    }
}
</style>
