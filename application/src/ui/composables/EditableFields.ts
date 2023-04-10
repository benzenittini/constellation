
import { reactive } from 'vue';
import { useVueModals } from 'mw-vue-modals';

import { useStore } from '../store/store';

import { ObjectUtils, TypedMap, Block, FieldDefinition, FieldType, PossibleValueDefinition, getFieldValue } from 'constellation-common';
import { SetFieldDefinitionsAction } from '../actions/board-actions/SetFieldDefinitions';
import { SetFieldOnBlocksAction } from '../actions/board-actions/SetFieldOnBlocks';


function openEditFieldsDialog(blockIds: string[], fieldIds: string[], fieldDefs: TypedMap<FieldDefinition>, possibleValueDefs: TypedMap<PossibleValueDefinition>) {
    let mwVueModals = useVueModals();

    let dialogId = "edit-fields";

    let originalFieldIds = fieldIds; // Useful for determining which fields were deleted

    type EditFieldsModalData = { fieldDefs: FieldDefinition[], possibleValueDefs: TypedMap<PossibleValueDefinition> };
    let modalData: EditFieldsModalData = reactive(JSON.parse(JSON.stringify({ 
        fieldDefs: fieldIds.map(fid => fieldDefs[fid]),
        possibleValueDefs: possibleValueDefs,
    })));

    // Grabbing the value of this array now in case the user's selection changes while they're
    // inside the dialog.
    let blockIdsToUpdate = blockIds;

    mwVueModals.createOrUpdateModal({
        id: dialogId,
        styleOverrides: {
            'width': '850px',
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
                            let fieldDefinitions = modalData.fieldDefs.reduce((prev: TypedMap<FieldDefinition>, curr) => {
                                prev[curr.id] = curr;
                                return prev;
                            }, {});
                            let fieldIds = modalData.fieldDefs.map(f => f.id);
                            let deletedFieldIds = originalFieldIds.filter(fid => !modalData.fieldDefs.some(field => field.id === fid));
                            let possibleValueDefinitions = modalData.fieldDefs.reduce((prev: TypedMap<PossibleValueDefinition>, curr) => {
                                curr.possibleValueIds?.forEach(pvid => {
                                    prev[pvid] = modalData.possibleValueDefs[pvid];
                                });
                                return prev;
                            }, {});

                            new SetFieldDefinitionsAction(
                                JSON.parse(JSON.stringify(blockIdsToUpdate)),
                                JSON.parse(JSON.stringify(fieldDefinitions)),
                                JSON.parse(JSON.stringify(fieldIds)),
                                JSON.parse(JSON.stringify(possibleValueDefinitions)),
                                JSON.parse(JSON.stringify(deletedFieldIds)),
                            ).submit();

                            mwVueModals.closeModal(dialogId);
                        },
                    }
                },
                'main': {
                    componentName: 'eic-edit-fields-dialog',
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

function setFieldValueOnBlocks(blocks: Block[], fieldId: string, valueChangeEvent: any) {
    const store = useStore();

    const fieldDefs = store.getters.fields;

    const blockIdToFieldValue: TypedMap<any> = {};

    // If this event came from a checkbox, then we need to interpret the event to get
    // the correct "newValue" array.
    if (ObjectUtils.isObjectWithKeys(valueChangeEvent, ['value', 'isSelected'])) {
        blocks.forEach(e => {
            let existingValue: string[] = getFieldValue(FieldType.CHECKBOXES, e.fieldValues[fieldId]);
            if (valueChangeEvent.isSelected && !existingValue.includes(valueChangeEvent.value)) {
                blockIdToFieldValue[e.id] = [...existingValue, valueChangeEvent.value];
            } else if (!valueChangeEvent.isSelected) {
                blockIdToFieldValue[e.id] = existingValue.filter(v => v !== valueChangeEvent.value);
            } else {
                blockIdToFieldValue[e.id] = existingValue;
            }
        });
    }
    // If this event came from a date+time field, don't clear the value ... but only sometimes.
    else if (fieldDefs[fieldId].type === FieldType.DATETIME && (valueChangeEvent.date === '' || valueChangeEvent.time === '') && blocks.length > 1) {
        // We receive an object of the for { date: '', time: '' }. If either 'date' or 'time' is empty, it could mean one of two things:
        // 1. The user intentionally cleared the date/time
        // 2. It's a datetime field, and the user is editing multiple blocks. The blocks all have different times, and the user set a
        //    date for them to share.
        //
        // In the first case, we just update the field value like normal. In the second case, though, we only want to update the
        // changed/set value - not the empty one. To differentiate, we need to look at the list of blocks and check how many unique
        // date/time values they have. If there's only one unique value for a given date/time, then clear the value. Otherwise, assume
        // the valueChangeEvent is only showing an empty field because the selected blocks differ in value.

        // Determine how many unique dates and unique times there are to decide whether we should overwrite existing values with ''
        let setOfDates = new Set();
        let setOfTimes = new Set();
        blocks.forEach(e => {
            let blockFV = getFieldValue(FieldType.DATETIME, e.fieldValues[fieldId]);
            setOfDates.add(blockFV.date);
            setOfTimes.add(blockFV.time);
        });
        const persistEmptyDate = setOfDates.size === 1;
        const persistEmptyTime = setOfTimes.size === 1;

        // Build up the "update" object, only overwriting the existing date/time with an empty value if the above logic says to.
        blocks.forEach(e => {
            let newValue = {...valueChangeEvent};
            let blockFV = getFieldValue(FieldType.DATETIME, e.fieldValues[fieldId]);
            if (newValue.date === '' && !persistEmptyDate) newValue.date = blockFV.date;
            if (newValue.time === '' && !persistEmptyTime) newValue.time = blockFV.time;
            blockIdToFieldValue[e.id] = newValue;
        });
    }
    // Otherwise, each block will have the same value.
    else {
        blocks.forEach(e => { blockIdToFieldValue[e.id] = valueChangeEvent; });
    }

    new SetFieldOnBlocksAction(
        fieldId,
        JSON.parse(JSON.stringify(blockIdToFieldValue)),
    ).submit();
}

export function useEditableFields() {
    return {
        openEditFieldsDialog,
        setFieldValueOnBlocks,
    };
}