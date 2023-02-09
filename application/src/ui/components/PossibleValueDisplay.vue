<template>
    <div class="eic-form-component mw-possiblevaluedisplay">
        <div class="eic-border">
            <div class="eic-value-display">
                <span class="eic-placeholder">{{ displayValue }}</span>
                <eic-svg-gear></eic-svg-gear>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

import { PossibleValueDefinition } from "../store/Types/FieldDataTypes";

export default defineComponent({
    props: {
        eicPossibleValueDefs: Array,
        eicPlaceholder: String,
    },
    setup(props) {
        return {
            displayValue: computed(() => {
                if (props.eicPossibleValueDefs && props.eicPossibleValueDefs.length > 0) {
                    let joinedText = (props.eicPossibleValueDefs as PossibleValueDefinition[]).map(pvDef => pvDef.name).join(', ');
                    if (joinedText.trim() === '') joinedText = '(none)';
                    return joinedText;
                } else if (props.eicPlaceholder) {
                    return props.eicPlaceholder;
                } else {
                    return '';
                }
            }),
        }
    }
})
</script>

<style lang="scss">
@use "../styles/variables" as vars;

.mw-possiblevaluedisplay {
    cursor: pointer;

    &.is-focused {
        .eic-border        { background-position: bottom; }
        .mw-svg-gear       { fill: vars.$gray-very-light; }
    }

    // The bottom border - a separate "div" so it can have a cool effect when hovered.
    .eic-border {
        display: inline-block;
        border-radius: vars.$component-radius + 1; // +1 to hide some ugly top corners
        padding-bottom: 1px;
        width: 100%;
        transition: background-position 0.2s ease-out; // "ease-out" to help counteract the "roundedness" of the radial gradient
        background: radial-gradient(51% 50% at bottom, vars.$gray-very-light 100%, vars.$gray4 100%) top;
        background-size: 100% 200%;
    }

    // Standard input styling
    .eic-value-display {
        position: relative;
        background: vars.$gray1;
        border: none;
        border-radius: vars.$component-radius;
        padding: 8px 32px 8px 12px;
        color: vars.$gray-very-light;
        font-size: 1.0rem;
        outline: none;
        width: 100%;

        // Don't linewrap
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
        vertical-align: middle;

        .mw-svg-gear {
            position: absolute;
            right: 5px;
            height: 19px;
            transition: fill 0.2s;
        }
    }
}
</style>
