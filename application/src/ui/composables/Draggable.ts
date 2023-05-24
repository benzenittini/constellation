
import { computed, reactive, ref } from 'vue';

export function useDraggable() {
    let metadata: any = { data: {} };

    let offset = reactive({x: 0, y: 0});
    let isDragging = ref(false);
    let startCoords = reactive({x: 0, y: 0});
    let currentCoords = reactive({x: 0, y: 0});

    let boundingBox = computed(() => {
        return {
            x: Math.min(startCoords.x, currentCoords.x),
            y: Math.min(startCoords.y, currentCoords.y),
            width: Math.abs(currentCoords.x - startCoords.x),
            height: Math.abs(currentCoords.y - startCoords.y),
        };
    });

    let deltaDrag = computed(() => {
        return {
            deltaX: currentCoords.x - startCoords.x,
            deltaY: currentCoords.y - startCoords.y
        };
    });

    let hasMoved = computed(() => {
        return isDragging.value && (startCoords.x !== currentCoords.x || startCoords.y !== currentCoords.y);
    });

    return {
        // Variables
        metadata,
        isDragging,
        boundingBox,
        deltaDrag,
        startCoords,
        currentCoords,
        hasMoved,

        // Methods
        setOffset: (offsetX: number, offsetY: number) => {
            offset.x = offsetX;
            offset.y = offsetY;
        },
        mouseDown: (mouseEvent: MouseEvent, dragMetadata?: any) => {
            metadata.data = dragMetadata;
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