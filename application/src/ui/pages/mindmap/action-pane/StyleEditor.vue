<template>
    <div class="mw-app-actionpane-styleeditor">
        <!-- Error explanation time!
                Binding a key on the template throws an error in VSCode. (vetur)
                Not binding a key on the subcomponents throws an error in VSCode. (vetur)
                Binding a key to the subcomponents throws an error during compilation. (vs-loader bug?)

                To get compilation to pass, I'm putting the binding on the template. It's a huge pain
                to override VSCode's (vetur's) linting ... so enjoy red squiggles.

                https://v3.vuejs.org/guide/migration/key-attribute.html#with-template-v-for
                -->
        <template v-for="option of configRows" v-bind:key="option.id">
            <!-- Name -->
            <div v-bind:class="getClassBinding('name', option.id)"
                v-bind:style="{ color: isModified(option.chosenColor.value, option.defaultColor) ? GRAY8 : 'inherit' }">
                {{ option.display }}
            </div>

            <!-- Recent Colors -->
            <div v-bind:class="getClassBinding('recent-colors', option.id)">
                <svg viewBox="0 0 300 200"
                    v-show="eicBoardColors.length > 0 || eicProjectColors.length > 0"
                    v-on:click="openRecentColorsModal(option.id)">
                    <!-- Top row -->
                    <rect x="0" y="0" width="80" height="80" fill="#234A97"></rect>   <!-- blue -->
                    <rect x="110" y="0" width="80" height="80" fill="#239735"></rect> <!-- green -->
                    <rect x="220" y="0" width="80" height="80" fill="#000000"></rect> <!-- black -->
                    <!-- Bottom row -->
                    <rect x="0" y="110" width="80" height="80" fill="#993636"></rect>   <!-- red -->
                    <rect x="110" y="110" width="80" height="80" fill="#997D36"></rect> <!-- gold -->
                    <rect x="220" y="110" width="80" height="80" fill="#973699"></rect> <!-- pinkurple -->
                </svg>
            </div>

            <!-- Color Picker -->
            <div v-bind:class="getClassBinding('color-picker', option.id)">
                <input type="color"
                    v-bind:value="option.chosenColor.value || option.defaultColor"
                    v-on:change="$emit('mw-color-changed', { id: option.id, color: $event.target.value })">
            </div>

            <!-- Reset Button -->
            <div v-bind:class="getClassBinding('reset', option.id)"
                v-show="isModified(option.chosenColor.value, option.defaultColor)"
                v-on:click="$emit('mw-color-changed', { id: option.id, color: undefined })">
                <span title="Reset to default color">
                    <eic-svg-reset-arrow></eic-svg-reset-arrow>
                </span>
            </div>
        </template>

        <!-- Sample Swatch -->
        <div class="sample-swatch">
            <div class="sample-block" v-bind:style="sampleBlockStyle">
                <span>Sample Style</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, reactive } from "vue";
import { useVueModals } from 'mw-vue-modals';

import { GRAY0, GRAY3, GRAY8 } from "../../../styles/styleVariables";

export default defineComponent({
    props: {
        // Recent Colors
        eicProjectColors: Array,
        eicBoardColors: Array,
        // Active / Selected Colors
        eicBorderColor: String,
        eicBackgroundColor: String,
        eicTextColor: String,
    },
    setup(props, context) {
        let mwVueModals = useVueModals();

        let configRows = [
            { id: 'border',     display: "Border",     chosenColor: ref(computed(() => props.eicBorderColor)),     defaultColor: GRAY3 },
            { id: 'background', display: "Background", chosenColor: ref(computed(() => props.eicBackgroundColor)), defaultColor: GRAY0 },
            { id: 'text',       display: "Text",       chosenColor: ref(computed(() => props.eicTextColor)),       defaultColor: GRAY8 },
        ];
        return {
            GRAY8,

            // Variables
            configRows,

            // Methods
            getClassBinding: (...classes: string[]) => {
                let retVal: any = {};
                classes.forEach(c => retVal[c] = true);
                return retVal;
            },
            isModified: (currentValue: string, defaultValue: string) => {
                return currentValue && currentValue !== defaultValue;
            },
            openRecentColorsModal: (optionId: string) => {
                const dialogId = 'recent-colors-modal';

                let modalData = reactive({
                    projectColors: props.eicProjectColors,
                    boardColors: props.eicBoardColors,
                });

                mwVueModals.createOrUpdateModal({
                    id: dialogId,
                    clickOutsideToClose: true,
                    styleOverrides: {
                        'width': '230px',
                    },
                    layout: {
                        componentName: 'mw-vm-no-layout',
                        panes: {
                            'main': {
                                componentName: 'eic-recent-color-picker',
                                componentData: modalData,
                                styleOverrides: {},
                                eventHandlers: {
                                    'mw-color-picked': (color: string) => {
                                        context.emit('mw-color-changed', { id: optionId, color });
                                        mwVueModals.closeModal(dialogId);
                                    }
                                }
                            }
                        }
                    }
                });
            },

            // Computed Variables
            sampleBlockStyle: computed(() => {
                let style: any = {
                    width: '175px',
                    height: '70px'
                };
                configRows.forEach(row => {
                    switch (row.id) {
                        case 'border':
                            style.border = '3px solid ' + (row.chosenColor.value || row.defaultColor);
                            break;
                        case 'background':
                            style.background = row.chosenColor.value || row.defaultColor;
                            break;
                        case 'text':
                            style.color = row.chosenColor.value || row.defaultColor;
                            break;
                    }
                });
                return style;
            }),
        }
    }
})
</script>

<style>

.mw-app-actionpane-styleeditor {
    /* -- Basics -- */
    font-size: 18px;
    color: var(--gray4);
    margin: 10px 0px 10px 30px;
    padding: 10px;

    /* -- Layout -- */
    display: grid;
    grid-auto-columns: minmax(12px, auto);
    grid-auto-rows: auto;
    grid-gap: 5px 15px;
    .name          { grid-column: 1; }
    .recent-colors { grid-column: 2; width: 35px; }
    .color-picker  { grid-column: 3; }
    .reset         { grid-column: 4; }
    .border        { grid-row: 1; }
    .background    { grid-row: 2; }
    .text          { grid-row: 3; }
    .sample-swatch { grid-column: 5 / 7; grid-row: 1 / 4; }

    /* -- Other -- */
    .recent-colors>svg  { cursor: pointer; }
    .color-picker>input { cursor: pointer; }
    .reset              { cursor: pointer; }

    .mw-svg-resetarrow {
        width: 20px;
        vertical-align: middle;
        fill: var(--gray4);
        &:hover { fill: var(--gray-very-light); }
    }

    /* -- Swatch Styling -- */
    .sample-swatch {
        align-self: center;

        .sample-block {
            border-radius: 20px;
            font-size: 16px;
            position: relative;

            span {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                white-space: nowrap;
            }
        }
    }
}

</style>
