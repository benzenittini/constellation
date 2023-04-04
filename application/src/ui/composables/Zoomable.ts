
import { computed, ref, reactive } from 'vue';
import TWEEN, { Group, Tween } from '@tweenjs/tween.js';
import { useStore } from '../store/store';

const store = useStore();

const ZOOM_SPEED = computed(() => store.state.generalData.uiFlags.zoomSpeed);
const MULTIPLIER = 0.08;

const useShiftToZoom = computed(() => store.state.generalData.uiFlags.useShiftToZoom);

const IS_MAC = navigator.userAgent.includes('Mac');

export function useZoomable(pannable: any) {
    let scale = ref(1);
    let offset = reactive({x: 0, y: 0});
    let activeTween: Tween<{ value: number }> | undefined;

    let scaleString = computed(() => {
        return `scale(${scale.value})`;
    });

    let zoomTo = (newScale: number, duration: number, tweenGroup: Group) => {
        activeTween?.stop();
        activeTween = new TWEEN.Tween(scale, tweenGroup)
            .easing(TWEEN.Easing.Quadratic.Out)
            .to({ value: newScale })
            .duration(duration)
            .start();
    }

    let zoom = (factor: number, wheelEvent: WheelEvent) => {
        // For some OS's, holding down "shift" makes the wheel event be deltaX instead.
        // ... and since the user holds down shift to zoom, need to pick that up.
        let deltaY = wheelEvent.deltaY || wheelEvent.deltaX;

        // Mode "0" is pixel-scrolling. This gets it (roughly) onto the same scale as line-scrolling (mode 1)
        if (wheelEvent.deltaMode === 0) deltaY /= 30;

        // Adjust the zoom level
        let amountZoomed = deltaY * factor;
        scale.value += scale.value * amountZoomed;
        scale.value = Math.max(0.05, scale.value);

        // Pan the screen to make the zoom appear centered on the mouse
        let panX = amountZoomed * ((wheelEvent.clientX - offset.x) - pannable.deltaDrag.value.x);
        let panY = amountZoomed * ((wheelEvent.clientY - offset.y) - pannable.deltaDrag.value.y);
        pannable.panBy(panX, panY);
    }

    return {
        // Variables
        scale,
        scaleString,

        // Methods
        setOffset: (offsetX: number, offsetY: number) => {
            offset.x = offsetX;
            offset.y = offsetY;
        },
        zoomTo,
        wheel: (wheelEvent: WheelEvent) => {
            if (IS_MAC && wheelEvent.ctrlKey) {
                // Why ctrl? Well, browsers set the ctrl key to true if the user is doing a pinch-to-zoom action:
                // https://kenneth.io/post/detecting-multi-touch-trackpad-gestures-in-javascript
                zoom(-10/4 * MULTIPLIER * ZOOM_SPEED.value, wheelEvent);
            } else {
                const shouldZoom = useShiftToZoom.value
                    ? wheelEvent.shiftKey
                    : wheelEvent.ctrlKey || wheelEvent.metaKey; // metaKey is cmd on Mac
                if (shouldZoom) {
                    zoom(MULTIPLIER * ZOOM_SPEED.value, wheelEvent);
                }
            }
        },
    };
}