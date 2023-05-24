<template>
    <div id="mw-user-settings">
        <div class="mw-pan-zoom-settings">
            <label for="pan-speed">Pan Speed</label>
            <input id="pan-speed" type="range" min="0.1" max="3" step="0.1" v-model="panSpeed">
            <span>({{ panSpeed }}x)</span>
            <label for="zoom-speed">Zoom Speed</label>
            <input id="zoom-speed" type="range" min="0.1" max="3" step="0.1" v-model="zoomSpeed">
            <span>({{ zoomSpeed }}x)</span>
        </div>

        <div class="mw-toggle-settings">
            <eic-checkbox v-model="ctrlShiftForSelection" eic-label="Switch CTRL and SHIFT for block selection"></eic-checkbox>
            <eic-checkbox v-model="shiftToZoom" eic-label="Use SHIFT to zoom instead of CTRL"></eic-checkbox>
            <eic-checkbox v-model="invertScrollDirection" eic-label="Invert the scroll direction when zooming"></eic-checkbox>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

import { UserSettings } from 'constellation-common/datatypes';

import { SetUserSettingsAction } from '../../actions/project-actions/SetUserSettings';
import { GeneralDataActions } from '../../store/Types/GeneralStoreTypes';
import { useStore } from '../../store/store';

export default defineComponent({
    setup(props) {
        const store = useStore();

        function createMutableComputed(propName: keyof UserSettings, actionName: keyof GeneralDataActions) {
            let timeout: null | number = null;
            return computed({
                get() { return store.state.generalData.uiFlags[propName]; },
                set(newVal) {
                    store.dispatch(actionName, newVal);
                    if (timeout) {
                        window.clearTimeout(timeout);
                    }
                    timeout = window.setTimeout(() => {
                        new SetUserSettingsAction({ [propName]: newVal }).submit();
                    }, 5000);
                }
            });
        }

        let panSpeed              = createMutableComputed('panSpeed',                    'setPanSpeed');
        let zoomSpeed             = createMutableComputed('zoomSpeed',                   'setZoomSpeed');
        let shiftToZoom           = createMutableComputed('useShiftToZoom',              'useShiftToZoom');
        let ctrlShiftForSelection = createMutableComputed('switchCtrlShiftForSelection', 'switchCtrlShiftForSelection');
        let invertScrollDirection = createMutableComputed('invertScrollDirection',       'invertScrollDirection');

        return {
            panSpeed, zoomSpeed,
            ctrlShiftForSelection, shiftToZoom,
            invertScrollDirection,
        };
    },
});
</script>

<style lang="scss">

@use "../../styles/variables" as vars;

#mw-user-settings {
    .mw-pan-zoom-settings {
        margin: 24px;
        display: grid;
        grid-template-columns: 100px 200px 1fr;
        gap: 10px;
    }

    .mw-toggle-settings {
        margin: 24px;
    }
}

</style>
