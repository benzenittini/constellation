<template>
    <div id="mw-filtercontrols">
        <div class="mw-controls-row">
            <div class="mw-controls-horiz-flex">
                <div>
                    <h2>Selecting Blocks</h2>
                    <div class="mw-controls-inner-flex">
                        <figure>
                            <div class="fig-icon">
                                <img src="../../graphics/mouse-left-click.png">
                            </div>
                            <figcaption>Left-click to select a block</figcaption>
                        </figure>
                        <figure>
                            <div class="fig-icon">
                                <span><eic-keyboard-key mwKeyText="Shift"></eic-keyboard-key></span>
                                <img src="../../graphics/mouse-left-click.png">
                            </div>
                            <figcaption>Hold shift and left-click to toggle a selection</figcaption>
                        </figure>
                    </div>
                </div>
            </div>
        </div>

        <div class="mw-controls-row">
            <div class="mw-controls-horiz-flex">
                <div>
                    <h2>Deleting Blocks</h2>
                    <figure>
                        <div class="fig-icon">
                            <span><eic-keyboard-key mwKeyText="Delete"></eic-keyboard-key></span>
                            <span class="or-text">or</span>
                            <span><eic-keyboard-key mwKeyText="Backspace"></eic-keyboard-key></span>
                        </div>
                        <figcaption class="long-caption">Select one or more blocks, then press delete or backspace</figcaption>
                    </figure>
                </div>
                <div>
                    <h2>Jump to Block</h2>
                    <figure>
                        <div class="fig-icon">
                            <img src="../../graphics/mouse-left-click.png">
                            <span class="x2-text">x2</span>
                        </div>
                        <figcaption class="long-caption">Double-click a block to jump to its location on the mind map</figcaption>
                    </figure>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    props: {},
    setup() {
        return {};
    }
})
</script>

<style lang="scss">

@use "../../styles/variables" as vars;
@use "controls";

#mw-filtercontrols {
    padding: 0 20px;
    width: 750px;
}

</style>
