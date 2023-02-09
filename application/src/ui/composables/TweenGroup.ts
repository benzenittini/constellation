
import TWEEN from '@tweenjs/tween.js';

export const sharedTweenGroup = new TWEEN.Group();

export function useTweenGroup() {

    function updateGroup(time: number) {
        if (sharedTweenGroup && sharedTweenGroup.getAll().length > 0) {
            setTimeout(() => {
                if (sharedTweenGroup && sharedTweenGroup.getAll().length > 0) {
                    requestAnimationFrame(updateGroup)
                    sharedTweenGroup?.update(time)
                }
            }, 1000/60); // 60 fps
        }
    }
    function stopGroup() {
        sharedTweenGroup?.removeAll();
    }

    return {
        sharedTweenGroup,
        updateGroup,
        stopGroup,
    };
}

export type MWTweenGroup = ReturnType<typeof useTweenGroup>;