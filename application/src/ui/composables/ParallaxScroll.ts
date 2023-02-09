
import { computed, ref, watch, watchEffect } from 'vue';

export function useParallaxScroll() {
    let scrollDistance = ref(0);
    let scrollPercent = ref(0);

    let timer: null | number = null;

    return {
        scrollPercent,
        scrollDistance,
        updateScrollPercent: () => {
            if (timer === null) {
                timer = window.setTimeout(() => {
                    let p = document.body.parentNode as any;
                    scrollDistance.value = document.body.scrollTop || p.scrollTop
                    scrollPercent.value = (scrollDistance.value) / (p.scrollHeight - p.clientHeight);
                    timer = null;
                }, 1000/20); // 20 fps
            }
        },
    };
}