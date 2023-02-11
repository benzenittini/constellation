
import { computed } from 'vue';

import { useStore } from '../store/store';
import * as ArrayUtils from '../../common/ArrayUtils';

export function usePermissions() {

    const store = useStore();
    let currentAppPermissions = computed(() => store.getters.currentPermissions);

    let canEditBoardContents        = computed(() => ArrayUtils.includesAny(currentAppPermissions.value, ['BOARD_OWNER', 'BOARD_EDIT_CONTENTS']));
    let canEditBoardClassifications = computed(() => ArrayUtils.includesAny(currentAppPermissions.value, ['BOARD_OWNER', 'BOARD_EDIT_CLASSIFICATIONS']));

    return {
        canEditBoardContents,
        canEditBoardClassifications,
    };
}