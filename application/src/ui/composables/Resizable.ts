
import { computed, reactive, ref } from 'vue';

export enum ResizeDirection {
    N, NE, E, SE, S, SW, W, NW
}

export function useResizable() {
    let myResizeDirection = ref(ResizeDirection.SE);

    let offset = reactive({x: 0, y: 0});
    let isDragging = ref(false);
    let startCoords = reactive({x: 0, y: 0});
    let currentCoords = reactive({x: 0, y: 0});

    let deltaDrag = computed(() => {
        let retObj = { deltaX: 0, deltaY: 0, deltaWidth: 0, deltaHeight: 0 }
        switch (myResizeDirection.value) {
            case ResizeDirection.N:
                retObj.deltaY = currentCoords.y - startCoords.y;
                retObj.deltaHeight = startCoords.y - currentCoords.y;
                break;
            case ResizeDirection.NE:
                retObj.deltaWidth = currentCoords.x - startCoords.x;
                retObj.deltaY = currentCoords.y - startCoords.y;
                retObj.deltaHeight = startCoords.y - currentCoords.y;
                break;
            case ResizeDirection.E:
                retObj.deltaWidth = currentCoords.x - startCoords.x;
                break;
            case ResizeDirection.SE:
                retObj.deltaWidth = currentCoords.x - startCoords.x;
                retObj.deltaHeight = currentCoords.y - startCoords.y;
                break;
            case ResizeDirection.S:
                retObj.deltaHeight = currentCoords.y - startCoords.y;
                break;
            case ResizeDirection.SW:
                retObj.deltaX = currentCoords.x - startCoords.x;
                retObj.deltaWidth = startCoords.x - currentCoords.x;
                retObj.deltaHeight = currentCoords.y - startCoords.y;
                break;
            case ResizeDirection.W:
                retObj.deltaX = currentCoords.x - startCoords.x;
                retObj.deltaWidth = startCoords.x - currentCoords.x;
                break;
            case ResizeDirection.NW:
                retObj.deltaX = currentCoords.x - startCoords.x;
                retObj.deltaWidth = startCoords.x - currentCoords.x;
                retObj.deltaY = currentCoords.y - startCoords.y;
                retObj.deltaHeight = startCoords.y - currentCoords.y;
                break;
        }
        return retObj;
    });

    let hasMoved = computed(() => {
        return isDragging.value && (startCoords.x !== currentCoords.x || startCoords.y !== currentCoords.y);
    });

    return {
        // Variables
        isDragging,
        deltaDrag,
        hasMoved,

        // Methods
        setOffset: (offsetX: number, offsetY: number) => {
            offset.x = offsetX;
            offset.y = offsetY;
        },
        mouseDown: (mouseEvent: MouseEvent, resizeDirection: ResizeDirection) => {
            myResizeDirection.value = resizeDirection;
            isDragging.value = true;
            startCoords.x = mouseEvent.clientX - offset.x;
            startCoords.y = mouseEvent.clientY - offset.y;
            currentCoords.x = mouseEvent.clientX - offset.x;
            currentCoords.y = mouseEvent.clientY - offset.y;
        },
        mouseMove: (mouseEvent: MouseEvent) => {
            if (isDragging.value) {
                currentCoords.x = mouseEvent.clientX - offset.x;
                currentCoords.y = mouseEvent.clientY - offset.y;
            }
        },
        mouseUp: () => {
            isDragging.value = false;

            startCoords.x = 0;
            startCoords.y = 0;
            currentCoords.x = 0;
            currentCoords.y = 0;
        },
    };
}