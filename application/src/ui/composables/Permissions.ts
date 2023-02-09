
import { computed } from 'vue';

import { useGeneralStore } from '../store/GeneralStore';
import * as ArrayUtils from '../utilities/ArrayUtils';

export function usePermissions() {

    const generalStore = useGeneralStore();
    let currentAppPermissions = generalStore.currentAppPermissions();

    let canEditBoardContents        = computed(() => ArrayUtils.includesAny(currentAppPermissions.value, ['BOARD_OWNER', 'BOARD_EDIT_CONTENTS']));
    let canEditBoardClassifications = computed(() => ArrayUtils.includesAny(currentAppPermissions.value, ['BOARD_OWNER', 'BOARD_EDIT_CLASSIFICATIONS']));

    return {
        canEditBoardContents,
        canEditBoardClassifications,
    };
}