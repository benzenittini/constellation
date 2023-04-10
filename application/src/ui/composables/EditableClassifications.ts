
import { reactive } from 'vue';
import { useVueModals } from 'mw-vue-modals';

import { TypedMap, ClassificationDefinition, FieldDefinition, PossibleValueDefinition } from 'constellation-common/datatypes';
import { SetClassificationDefinitionsAction } from '../actions/board-actions/SetClassificationDefinitions';
import { SetClassificationOnBlocksAction } from '../actions/board-actions/SetClassificationOnBlocks';


function openEditClassificationsDialog(classificationIds: string[], classificationDefs: TypedMap<ClassificationDefinition>, fieldDefs: TypedMap<FieldDefinition>, possibleValueDefs: TypedMap<PossibleValueDefinition>) {
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
                    componentName: 'eic-savecancel',
                    eventHandlers: {
                        'mw-cancel': (event: any) => {
                            mwVueModals.closeModal(dialogId);
                        },
                        'mw-save': (event: any) => {
                            new SetClassificationDefinitionsAction(
                                JSON.parse(JSON.stringify(modalData.classificationIds)),
                                JSON.parse(JSON.stringify(modalData.classificationDefs)),
                                JSON.parse(JSON.stringify(modalData.fieldDefs)),
                                JSON.parse(JSON.stringify(modalData.possibleValueDefs)),
                            ).submit();

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
    new SetClassificationOnBlocksAction(
        JSON.parse(JSON.stringify(blockIds)),
        classificationId,
        isActive,
    ).submit();
}

export function useEditableClassifications() {
    return {
        openEditClassificationsDialog,
        setClassificationOnBlocks,
    };
}