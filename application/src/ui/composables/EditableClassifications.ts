
import { reactive } from 'vue';
import { useVueModals } from 'mw-vue-modals';

import { useStore } from '../store/store';

import { TypedMap } from '../../../../common/DataTypes/GenericDataTypes';
import { ClassificationDefinition, FieldDefinition, PossibleValueDefinition } from '../../../../common/DataTypes/FieldDataTypes';
// TODO-const : Re-enable all the actions
// import { UpdateClassificationDefinitions } from '../actions/WebsocketActions/UpdateClassificationDefinitions';
// import { UpdateClassificationOnBlocks } from '../actions/WebsocketActions/UpdateClassificationOnBlocks';


function openEditClassificationsDialog(classificationIds: string[], classificationDefs: TypedMap<ClassificationDefinition>, fieldDefs: TypedMap<FieldDefinition>, possibleValueDefs: TypedMap<PossibleValueDefinition>) {
    let store = useStore();
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
                            //     store.state.generalData.currentProjectBoard!.boardId,
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

function setClassificationOnBlocks(blockIds: string[], classificationId: string, isActive: boolean) {
    let store = useStore();

    // TODO-const : Re-enable all the actions
    // new UpdateClassificationOnBlocks(
    //     store.state.generalData.currentProjectBoard!.boardId,
    //     blockIds,
    //     classificationId,
    //     isActive
    // ).send();
}

export function useEditableClassifications() {
    return {
        openEditClassificationsDialog,
        setClassificationOnBlocks,
    };
}