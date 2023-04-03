
import { computed, reactive } from 'vue';
import TWEEN, { Group, Tween } from '@tweenjs/tween.js';
import { useStore } from '../store/store';

const store = useStore();

const PAN_SPEED = computed(() => store.state.generalData.uiFlags.panSpeed);

function hasAnyModifierKeys(mouseEvent: MouseEvent): boolean {
    return mouseEvent.altKey || mouseEvent.ctrlKey || mouseEvent.shiftKey || mouseEvent.metaKey;
}

export function usePannable() {
    let amountPanned = reactive({x: 0, y: 0});
    let activeTween: Tween<{x: number, y: number}> | undefined;

    let deltaDrag = computed(() => {
        return amountPanned;
    });
    let translateString = computed(() => {
        return `translate(${deltaDrag.value.x}px, ${deltaDrag.value.y}px)`;
    });

    let panTo = (x: number, y: number, duration: number, tweenGroup: Group) => {
        activeTween?.stop();
        activeTween = new TWEEN.Tween(amountPanned, tweenGroup)
            .easing(TWEEN.Easing.Quadratic.Out)
            .to({ x, y })
            .duration(duration)
            .start();
    }

    let panBy = (x: number, y: number) => {
        amountPanned.x -= x;
        amountPanned.y -= y;
    }

    return {
        // Variables
        deltaDrag,
        translateString,

        // Methods
        panTo,
        panBy,
        wheel: (wheelEvent: WheelEvent) => {
            if (!hasAnyModifierKeys(wheelEvent)) {
                let deltaX = wheelEvent.deltaX;
                let deltaY = wheelEvent.deltaY;

                // Mode "0" is pixel-scrolling. This gets it onto the same scale as line-scrolling (mode 1)
                if (wheelEvent.deltaMode === 1) {
                    deltaX *= 30;
                    deltaY *= 10;
                }

                panBy((deltaX * PAN_SPEED.value), (deltaY * PAN_SPEED.value));
            }
        },
    };
}