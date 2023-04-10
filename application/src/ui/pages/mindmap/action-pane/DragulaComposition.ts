import { Ref } from "vue";

import { TypedMap, ClassificationDefinition, FieldDefinition } from 'constellation-common/datatypes';

// =====================================================================================
// !!! >>> ATTENTION FUTURE READER <<< !!!
// -------------------------------------------------------------------------------------
// Hello there.
//
// In regards to all the drop* and cancel* functions below ...
//
// Dragula likes to edit the DOM. So does Vue. They don't like each other very much.
// There was an issue where if you moved the 2nd-to-last item to the end of the list,
// then added a new item to the list, the new item would appear above those other two
// items ... but *ONLY* visually. The backing Vue-bound data showed the new item in the
// correct spot.
//
// Then there was another similar issue where if you picked up the last item in the list
// and put it back down in the same spot, then added a new item to the list, the new
// item would appear above the item you picked up and put back down.
//
// There were many attempts to fix these two issues, all of which failed in some way.
// Attempts included:
// - Cancelling the dragula event with drake.cancel() (and many similar variations).
//   This fixed the first issue, but not the second.
// - Forcing Vue to re-render by adding an incrementing key to the draggable list. This
//   fixed both the issues ... but stripped all the dragula handlers from the lists,
//   breaking drag-and-drop entirely.
// - Forcing Vue to re-render using the getInstance().$forceUpdate() method. This didn't
//   seem to do anything, making me question any understanding I thought I had of the
//   problems.
//
// Finally, I decided to delay Vue's rendering, and force it to update the specific
// items entirely after dragula has released its hold by using the series of setTimeouts
// found below. Vue effectively renders before the setTimeouts, so what's happening
// during this 'drop' event handler is the following:
//   1. Remove the dragged item from the list.
//   2. Finish the dragula drag/drop event chain.
//   3. setTimeout, which causes a re-render.
//   4. Add the dragged item back to the list in the correct spot.
//   5. setTimeout, which causes a re-render.
//   6. Lastly, update the border points and focus the just-rendered textbox.
//
// Oh yeah, and I needed to add these same steps to the 'cancel' event too, because even
// when a drag event gets cancelled, the element still gets "removed and re-added" to
// the DOM without Vue's knowledge, causing the second issue mentioned above. ...so we
// remove it from the list, re-render, add it back to the exact same spot, and re-render
// again.
//
// Goodbye there.
// =====================================================================================


// ================
// Common Functions
// ----------------

function calculateScrollAmount(mouseEvent: MouseEvent) {
    let mouseY = mouseEvent.clientY;
    let dialogBB = (mouseEvent.currentTarget as HTMLElement).parentElement!.getBoundingClientRect();

    const scrollZoneHeight = 100;
    let distanceFromTop = mouseY - dialogBB.top;
    let distanceFromBottom = dialogBB.bottom - mouseY;

    if (distanceFromTop < scrollZoneHeight) {
        return -(scrollZoneHeight - distanceFromTop);
    } else if (distanceFromBottom < scrollZoneHeight) {
        return (scrollZoneHeight - distanceFromBottom);
    } else {
        return 0;
    }
}

function wasHandleGrabbed(handle: Element | undefined, handleClass: string): boolean {
    // The "|| false" is needed because "undefined" apparently isn't considered boolean to dragula.
    return handle?.classList.contains(handleClass)
        || handle?.parentElement?.classList.contains(handleClass)
        || false;
}

function dropPossibleValue(el: Element, sibling: Element, fieldDef: FieldDefinition, selectedPVId: Ref<string | undefined>, updatePathPoints: ()=>void, pvTextboxContainer: Ref<TypedMap<any>>) {
    // Remove the dragged classification from the underlying data
    let draggedPVId = el.getAttribute('mw-pv-id')!;
    let origIndex = fieldDef.possibleValueIds.indexOf(draggedPVId);
    fieldDef.possibleValueIds.splice(origIndex, 1);

    setTimeout(() => {
        // Now insert it back into the right spot
        let newIndex = undefined;
        if (sibling) {
            newIndex = fieldDef.possibleValueIds.indexOf(sibling.getAttribute('mw-pv-id')!);
            fieldDef.possibleValueIds.splice(newIndex, 0, draggedPVId);
        } else {
            fieldDef.possibleValueIds.push(draggedPVId);
        }

        selectedPVId.value = draggedPVId;

        // ...and fix the fancy border.
        setTimeout(() => {
            updatePathPoints();
            pvTextboxContainer.value[draggedPVId].getElementsByTagName('input')[0].focus();
        }, 0);
    }, 0);
}

function cancelPossibleValue(el: Element, fieldDef: FieldDefinition, selectedPVId: Ref<string | undefined>, updatePathPoints: ()=>void, pvTextboxContainer: Ref<TypedMap<any>>) {
    // Remove the dragged classification from the underlying data
    let draggedPVId = el.getAttribute('mw-pv-id')!;
    let origIndex = fieldDef.possibleValueIds.indexOf(draggedPVId);
    fieldDef.possibleValueIds.splice(origIndex, 1);

    // Now insert it back into the exact same spot because rage.
    setTimeout(() => {
        fieldDef.possibleValueIds.splice(origIndex, 0, draggedPVId);

        // ...and fix the fancy border.
        selectedPVId.value = draggedPVId;
        setTimeout(() => {
            updatePathPoints();
            pvTextboxContainer.value[draggedPVId].getElementsByTagName('input')[0].focus();
        }, 0);
    }, 0);
}


// ===========================
// Edit Classifications Dialog
// ---------------------------

function dropClassification(el: Element, sibling: Element, classificationIds: string[]) {
    // Remove the dragged classification from the underlying data
    let draggedId = el.getAttribute('mw-classification-id')!;
    let origIndex = classificationIds.indexOf(draggedId);
    classificationIds.splice(origIndex, 1);

    // Now insert it back into the right spot
    setTimeout(() => {
        if (sibling) {
            let newIndex = classificationIds.indexOf(sibling.getAttribute('mw-classification-id')!);
            classificationIds.splice(newIndex, 0, draggedId);
        } else {
            classificationIds.push(draggedId);
        }
    }, 0)
}

function cancelClassification(el: Element, classificationIds: string[]) {
    // Remove the dragged classification from the underlying data
    let draggedId = el.getAttribute('mw-classification-id')!;
    let origIndex = classificationIds.indexOf(draggedId);
    classificationIds.splice(origIndex, 1);

    // Now insert it back into the exact same spot because rage.
    setTimeout(() => {
        classificationIds.splice(origIndex, 0, draggedId);
    }, 0)
}

function dropClassificationField(el: Element, target: Element, source: Element, sibling: Element, classificationDefs: TypedMap<ClassificationDefinition>) {
    let movedFieldId = el.getAttribute('mw-field-id')!;
    let sourceClassificationId = source.getAttribute('mw-classification-id');
    let targetClassificationId = target.getAttribute('mw-classification-id');

    if (!sourceClassificationId || !targetClassificationId) return;

    // Remove the dragged field from the source classification
    let sourceClassification = classificationDefs[sourceClassificationId];
    let origIndex = sourceClassification.fieldIds.indexOf(movedFieldId);
    sourceClassification.fieldIds.splice(origIndex, 1);

    // Now insert it back into the right spot
    setTimeout(() => {
        let targetClassification = classificationDefs[targetClassificationId!];
        if (sibling) {
            let newIndex = targetClassification.fieldIds.indexOf(sibling.getAttribute('mw-field-id')!);
            targetClassification.fieldIds.splice(newIndex, 0, movedFieldId);
        } else {
            targetClassification.fieldIds.push(movedFieldId);
        }
    }, 0);
}

function cancelClassificationField(el: Element, target: Element, source: Element, classificationDefs: TypedMap<ClassificationDefinition>) {
    let movedFieldId = el.getAttribute('mw-field-id')!;
    let sourceClassificationId = source.getAttribute('mw-classification-id');
    let targetClassificationId = target.getAttribute('mw-classification-id');

    if (!sourceClassificationId || !targetClassificationId) return;

    // Remove the dragged field from the source classification
    let sourceClassification = classificationDefs[sourceClassificationId];
    let origIndex = sourceClassification.fieldIds.indexOf(movedFieldId);
    sourceClassification.fieldIds.splice(origIndex, 1);

    // Now insert it back into the exact same spot because rage.
    setTimeout(() => {
        let targetClassification = classificationDefs[targetClassificationId!];
        targetClassification.fieldIds.splice(origIndex, 0, movedFieldId);
    }, 0);
}


// ==================
// Edit Fields Dialog
// ------------------

function dropField(el: Element, sibling: Element, fieldDefs: FieldDefinition[]) {
    // Remove the dragged field from the underlying data
    let origIndex = fieldDefs.findIndex(field => field.id === el.getAttribute('mw-field-id'));
    let draggedField = fieldDefs!.splice(origIndex, 1);

    // Now insert it back into the right spot
    setTimeout(() => {
        if (sibling) {
            let newIndex = fieldDefs.findIndex(field => field.id === sibling.getAttribute('mw-field-id'));
            fieldDefs!.splice(newIndex, 0, ...draggedField);
        } else {
            fieldDefs!.push(...draggedField);
        }
    }, 0);
}

function cancelField(el: Element, fieldDefs: FieldDefinition[]) {
    // Remove the dragged field from the underlying data
    let origIndex = fieldDefs.findIndex(field => field.id === el.getAttribute('mw-field-id'));
    let draggedField = fieldDefs!.splice(origIndex, 1);

    // Now insert it back into the exact same spot because rage.
    setTimeout(() => {
        fieldDefs!.splice(origIndex, 0, ...draggedField);
    }, 0);
}

export function useDragula() {
    return {
        calculateScrollAmount,
        wasHandleGrabbed,

        dropPossibleValue,
        cancelPossibleValue,

        dropClassification,
        cancelClassification,
        dropClassificationField,
        cancelClassificationField,

        dropField,
        cancelField,
    };
}