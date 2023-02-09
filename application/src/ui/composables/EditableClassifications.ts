
import { reactive } from 'vue';
import { useVueModals } from 'mw-vue-modals';

import { useGeneralStore } from '../store/GeneralStore';

import { TypedMap } from '../store/StoreTypes';
import { ClassificationDefinition, FieldDefinition, PossibleValueDefinition } from '../store/Types/FieldDataTypes';
// TODO-const : Re-enable all the actions
// import { UpdateClassificationDefinitions } from '../actions/WebsocketActions/UpdateClassificationDefinitions';
// import { UpdateClassificationOnEntities } from '../actions/WebsocketActions/UpdateClassificationOnEntities';


function openEditClassificationsDialog(classificationIds: string[], classificationDefs: TypedMap<ClassificationDefinition>, fieldDefs: TypedMap<FieldDefinition>, possibleValueDefs: TypedMap<PossibleValueDefinition>) {
    let generalStore = useGeneralStore();
    let mwVueModals = useVueModals();

    let dialogId = "edit-classifications";

    type EditClassificationsModalData = {
        classificationIds: string[],
        classificationDefs: TypedMap<ClassificationDefinition>,
        fieldDefs: TypedMap<FieldDefinition>,
        possibleValueDefs: TypedMap<PossibleValueDefinition>,
    };
    let modalData: EditClassificationsModalData = reactive(JSON.parse(JSON.stringify({
        classificationIds,
        classificationDefs,
        fieldDefs,
        possibleValueDefs,
    })));

    mwVueModals.createOrUpdateModal({
        id: dialogId,
        styleOverrides: {
            'width': '900px',
        },
        layout: {
            componentName: 'mw-vm-fixed-bottom',
            panes: {
                'bottom': {
                    name: 'eic-savecancel',
                    eventHandlers: {
                        'mw-cancel': (event: any) => {
                            mwVueModals.closeModal(dialogId);
                        },
                        'mw-save': (event: any) => {

                            // TODO-const : Re-enable all the actions
                            // new UpdateClassificationDefinitions(
                            //     generalStore.rawState.currentViewData!.boardId,
                            //     modalData.classificationIds,
                            //     modalData.classificationDefs,
                            //     modalData.fieldDefs,
                            //     modalData.possibleValueDefs).send();

                            mwVueModals.closeModal(dialogId);
                        },
                    }
                },
                'main': {
                    componentName: 'eic-edit-classifications-dialog',
                    componentData: modalData,
                    styleOverrides: {
                        'max-height': '500px',
                    },
                    eventHandlers: {
                    }
                }
            }
        }
    });
}

function setClassificationOnEntities(entityIds: string[], classificationId: string, isActive: boolean) {
    let generalStore = useGeneralStore();

    // TODO-const : Re-enable all the actions
    // new UpdateClassificationOnEntities(
    //     generalStore.rawState.currentViewData!.boardId,
    //     entityIds,
    //     classificationId,
    //     isActive
    // ).send();
}

export function useEditableClassifications() {
    return {
        openEditClassificationsDialog,
        setClassificationOnEntities,
    };
}