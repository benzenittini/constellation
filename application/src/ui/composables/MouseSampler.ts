import { reactive, Ref, ref } from "vue";

export function useMouseSampler() {
    let lastEvent: Ref<MouseEvent | null> = ref(null);
    let moveSinceLastRead: { x: number, y: number } = reactive({ x: 0, y: 0 });

    let timer: number | null = null;
    let callback: ((lastEvent: MouseEvent, movementX: number, movementY: number) => void) | null = null;

    let recordEvent = (mouseEvent: MouseEvent) => {
        lastEvent.value = mouseEvent;
        moveSinceLastRead.x += mouseEvent.movementX;
        moveSinceLastRead.y += mouseEvent.movementY;

        if (timer === null) {
            timer = window.setTimeout(() => {
                if (callback) callback(lastEvent.value!, moveSinceLastRead.x, moveSinceLastRead.y);
                moveSinceLastRead = { x: 0, y: 0 };
                timer = null;
            }, 1000/40); // ~40 fps
        }
    }

    let setCallback = (cb: (lastEvent: MouseEvent, movementX: number, movementY: number) => void) => {
        callback = cb;
    }

    return {
        recordEvent,
        setCallback,
    };
}