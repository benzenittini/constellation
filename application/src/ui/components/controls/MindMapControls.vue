<template>
    <div id="mw-mindmapcontrols">
        <div class="mw-controls-row">
            <div class="mw-controls-horiz-flex">
                <div>
                    <h2>Zooming</h2>
                    <figure>
                        <div class="fig-icon">
                            <span><eic-keyboard-key v-bind:mwKeyText="zoomKey"></eic-keyboard-key></span>
                            <img src="../../graphics/mouse-scroll.png">
                        </div>
                        <figcaption class="long-caption">Hold {{ zoomKey.toLowerCase() }} and scroll to zoom</figcaption>
                    </figure>
                </div>
                <div>
                    <h2>Panning</h2>
                    <figure>
                        <div class="fig-icon">
                            <img src="../../graphics/mouse-right-click.png">
                            <eic-svg-arrow-2 width="50" height="50"></eic-svg-arrow-2>
                        </div>
                        <figcaption class="long-caption">Right-click and drag to pan</figcaption>
                    </figure>
                </div>
            </div>
        </div>
        <div class="mw-controls-row">
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
                        <img src="../../graphics/mouse-left-click.png">
                        <eic-svg-arrow-2 width="50" height="50"></eic-svg-arrow-2>
                    </div>
                    <figcaption>Left-click and drag to select multiple blocks</figcaption>
                </figure>
                <figure>
                    <div class="fig-icon">
                        <span><eic-keyboard-key v-bind:mwKeyText="addSelectKey"></eic-keyboard-key></span>
                        <img src="../../graphics/mouse-left-click.png">
                    </div>
                    <figcaption>Hold {{ addSelectKey.toLowerCase() }} and left-click to add to selection</figcaption>
                </figure>
                <figure>
                    <div class="fig-icon">
                        <span><eic-keyboard-key v-bind:mwKeyText="treeSelectKey"></eic-keyboard-key></span>
                        <img src="../../graphics/mouse-left-click.png">
                    </div>
                    <figcaption>Hold {{ treeSelectKey.toLowerCase() }} and left-click to select an entire branch</figcaption>
                </figure>
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
                    <h2>Creating Blocks</h2>
                    <div class="mw-controls-inner-flex">
                        <figure>
                            <div class="fig-icon">
                                <img src="../../graphics/mouse-left-click.png">
                                <span class="x2-text">x2</span>
                            </div>
                            <figcaption>Double-click the background</figcaption>
                        </figure>
                        <figure>
                            <div class="fig-icon">
                                <eic-svg-hierarchy-symbol width="40" height="40"></eic-svg-hierarchy-symbol>
                                <img src="../../graphics/mouse-left-click.png">
                                <eic-svg-arrow-2 width="50" height="50"></eic-svg-arrow-2>
                            </div>
                            <figcaption>Drag off the "hierarchy" symbol (hold ctrl to bulk-create)</figcaption>
                        </figure>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";

import { useStore } from "../../store/store";

export default defineComponent({
    props: {},
    setup() {
        const store = useStore();

        const switchCtrlShiftForSelection = computed(() => store.state.generalData.uiFlags.switchCtrlShiftForSelection);
        const useShiftToZoom = computed(() => store.state.generalData.uiFlags.useShiftToZoom);

        return {
            zoomKey: computed(() => useShiftToZoom.value ? 'Shift' : 'Ctrl'),
            treeSelectKey: computed(() => switchCtrlShiftForSelection.value ? 'Ctrl' : 'Shift'),
            addSelectKey: computed(() => switchCtrlShiftForSelection.value ? 'Shift' : 'Ctrl'),
        };
    }
})
</script>

<style lang="scss">

@use "../../styles/variables" as vars;
@use "controls";

#mw-mindmapcontrols {
    padding: 0 20px;
    width: 750px;
}

</style>
