
import { computed } from 'vue';

import { useStore } from './store';
import { Store } from './StoreTypes';
import { BoundingBox, Entity, EntityContent, EntityIdAndPosition, SearchCriteria } from './Types/EntityDataTypes';
import { rectangleContainsPoint } from '../../common/RectangleUtils';
import { getFieldValue } from './Types/FieldDataTypes';
import { GRAY8 } from '../styles/styleVariables';


// ===================
// "Private" functions
// -------------------

function rangesOverlap(x1: number, width1: number, x2: number, width2: number): boolean {
    let start1 = x1;
    let stop1 = x1 + width1;
    let start2 = x2;
    let stop2 = x2 + width2;

    if (start1 < start2 && start2 < stop1)
        return true;

    if (start2 < start1 && start1 < stop2)
        return true;

    return false;
}

// =======
// Getters
// -------

function visibleEntities(store: Store) {
    return computed(() => store.getters.visibleEntities);
}

function selectedEntities(store: Store) {
    return computed(() => store.getters.selectedEntities);
}
function selectedEntityIds(store: Store) {
    return computed(() => store.getters.selectedEntityIds);
}

function expandedEntityIds(store: Store) {
    return computed(() => store.getters.expandedEntityIds);
}

function entityAtCoordinates(store: Store, coordinates: {x: number, y: number}) {
    return Object.values(store.state.entityData.entities)
        .find(e => rectangleContainsPoint(e.location, coordinates));
}

function getStyles(store: Store, entity: Entity, entityDepth: number) {
    let style: any = {};

    let classificationIds = store.getters.classificationIds;
    let classificationDefs = store.getters.classifications;
    let fieldDefs = store.getters.fields;
    let pvDefs = store.getters.possibleValues;

    let applyStylesByFieldId = (fieldId: string) => {
        // Look up and apply the styles for the PVs that match this entity's field value(s).
        // Since checkboxes can have multiple values chosen, need to find ALL the PVs that match.
        let rawValue: any = getFieldValue(fieldDefs[fieldId].type, entity.fieldValues[fieldId]);
        let fieldValues: any[] = Array.isArray(rawValue) ? rawValue : [rawValue];
        fieldDefs[fieldId].possibleValueIds
            // Convert this field's pvIds to pvDefs
            .map(pvId => pvDefs[pvId])
            // Keep only the ones this entity has a value for
            .filter(pv => fieldValues.includes(pv.name))
            // Merge their styles.
            .forEach(pvDef => {
                if (pvDef?.style?.background) style['fill']   = pvDef.style.background;
                if (pvDef?.style?.border)     style['stroke'] = pvDef.style.border;
                if (pvDef?.style?.text)       style['color']  = pvDef.style.text;
            });
    }

    // Populate styles from the classifications
    classificationIds
        .filter(cid => entity.classificationIds.includes(cid))
        .forEach(cid => {
            classificationDefs[cid]
                // Keep only the fields that are defined on this entity
                .fieldIds?.filter((fid) => entity.fieldValues[fid])
                // Apply styles
                .forEach(fid => applyStylesByFieldId(fid));
        });

    // Populate styles from the fields
    entity.fieldIds
        // Keep only the ones defined directly on the entity. (not the classifications - that's handled above.)
        .filter(fid => fieldDefs[fid].sourceType === 'entity')
        // Apply styles
        .forEach(fid => applyStylesByFieldId(fid));

    // Populate any final style overrides that are important
    if (entity.isSelected) {
        style.filter = `drop-shadow(0 0 ${10/entityDepth}px ${GRAY8})`
    }
    style.strokeWidth = 3 / entityDepth;

    return style;
}
function getCssStyles(store: Store, block: Entity, entityDepth: number) {
    let svgStyle = getStyles(store, block, entityDepth);
    let retVal: any = {};
    if (svgStyle.fill)   retVal.background = svgStyle.fill;
    if (svgStyle.stroke) retVal.border = svgStyle.strokeWidth + 'px solid ' + svgStyle.stroke;
    if (svgStyle.color)  retVal.color = svgStyle.color;
    return retVal;
}

function entityIdBeingEdited(store: Store) {
    return computed(() => store.state.entityData.entityIdBeingEdited);
}

function entitySearch(store: Store, criteria: SearchCriteria) {
    return computed(() => store.getters.entitySearch(criteria));
}
function getSummaryText(store: Store, blockId: string) {
    return store.state.entityData.entities[blockId].content.data.text;
}

function activeClassificationFieldIds(store: Store, entityIds: string[]) {
    return computed(() => store.getters.activeClassificationFieldIds(entityIds));
}
function activeEntityFieldIds(store: Store, entityIds: string[]) {
    return computed(() => store.getters.activeEntityFieldIds(entityIds));
}
function activeFieldValueCounts(store: Store, entityIds: string[]) {
    return computed(() => store.getters.activeFieldValueCounts(entityIds));
}


// ===============
// Block Selection
// ---------------

function clearEntitySelection(store: Store) {
    store.dispatch("clearEntitySelection");
}

function selectEntity(store: Store, entityId: string, clearCurrentSelection: boolean) {
    store.dispatch("selectEntity", {entityId, clearCurrentSelection});
}

function selectEntities(store: Store, entityIds: string[], clearCurrentSelection: boolean) {
    store.dispatch("selectEntities", {entityIds, clearCurrentSelection});
}

function selectEntitiesByBoundingBox(store: Store, boundingBox: BoundingBox, clearCurrentSelection: boolean) {
    let entityIds: string[] = [];
    Object.keys(store.state.entityData.entities).forEach((key) => {
        let entityLocation = store.state.entityData.entities[key].location;
        // Determine if the bounding box overlaps this entity.
        // If it does, then add it to our entityIds array.
        if (rangesOverlap(entityLocation.x, entityLocation.width, boundingBox.x, boundingBox.width)
            && rangesOverlap(entityLocation.y, entityLocation.height, boundingBox.y, boundingBox.height)) {
                entityIds.push(key);
        }
    });

    store.dispatch("selectEntities", {entityIds, clearCurrentSelection});
}


function toggleBlockExpansion(store: Store, entityIds: string[]) {
    store.dispatch("lockOpenClosed", {entityIds});
}

function startEditingEntity(store: Store, entityId: string) {
    store.dispatch("startEditingEntity", entityId);
}

function stopEditingEntity(store: Store) {
    store.dispatch("stopEditingEntity");
}


function expandEntity(store: Store, entityId: string) {
    store.dispatch("expandEntity", entityId);
}
function contractEntity(store: Store, entityId: string) {
    store.dispatch("contractEntity", entityId);
}


// ==================
// Block Manipulation
// ------------------

function dragSelectedEntities(store: Store, deltaX: number, deltaY: number) {
    store.dispatch("dragSelectedEntities", {deltaX, deltaY});
}

function resizeSelectedEntities(store: Store, deltaX: number, deltaY: number) {
    store.dispatch("resizeSelectedEntities", {deltaX, deltaY});
}

function setEntityPositions(store: Store, entityIdsAndPositions: EntityIdAndPosition[]) {
    store.dispatch("setEntityPositions", entityIdsAndPositions);
}

function deleteEntities(store: Store, entityIds: string[]) {
    store.dispatch("deleteEntities", entityIds);
}
function deleteSelectedEntities(store: Store) {
    store.dispatch("deleteSelectedEntities");
}

function setEntityContent(store: Store, entityId: string, newContent: EntityContent) {
    store.dispatch("setEntityContent", {entityId, newContent});
}


// ================
// Block Priorities
// ----------------

function setBlockPriority(store: Store, blockId: string, higherThan: string | undefined) {
    store.dispatch('setBlockPriority', { blockId: [blockId], higherThan });
}
function removeBlockPriority(store: Store, blockId: string) {
    store.dispatch('removeBlockPriority', blockId);
}


export function useEntityStore() {
    let store = useStore();

    return {
        rawState: store.state.entityData,

        // -- Getters --
        visibleEntities:     () => visibleEntities(store),
        selectedEntities:    () => selectedEntities(store),
        selectedEntityIds:   () => selectedEntityIds(store),
        expandedEntityIds:   () => expandedEntityIds(store),
        entityAtCoordinates: (coordinates: {x: number, y: number}) => entityAtCoordinates(store, coordinates),
        getStyles:           (entity: Entity, canvasScale: number) => getStyles(store, entity, canvasScale),
        getCssStyles:        (entity: Entity, canvasScale: number) => getCssStyles(store, entity, canvasScale),
        entityIdBeingEdited: () => entityIdBeingEdited(store),

        entitySearch:   (criteria: SearchCriteria) => entitySearch(store, criteria),
        getSummaryText: (blockId: string) => getSummaryText(store, blockId),

        activeClassificationFieldIds: (entityIds: string[]) => activeClassificationFieldIds(store, entityIds),
        activeEntityFieldIds:         (entityIds: string[]) => activeEntityFieldIds(store, entityIds),
        activeFieldValueCounts:       (entityIds: string[]) => activeFieldValueCounts(store, entityIds),

        // -- Block Selection --
        clearEntitySelection:        () => clearEntitySelection(store),
        selectEntity:                (entityId: string, clearCurrentSelection: boolean) => selectEntity(store, entityId, clearCurrentSelection),
        selectEntities:              (entityIds: string[], clearCurrentSelection: boolean) => selectEntities(store, entityIds, clearCurrentSelection),
        selectEntitiesByBoundingBox: (boundingBox: BoundingBox, clearCurrentSelection: boolean) => selectEntitiesByBoundingBox(store, boundingBox, clearCurrentSelection),

        toggleBlockExpansion: (entityIds: string[]) => toggleBlockExpansion(store, entityIds),

        startEditingEntity: (entityId: string) => startEditingEntity(store, entityId),
        stopEditingEntity:  () => stopEditingEntity(store),

        expandEntity:   (entityId: string) => expandEntity(store, entityId),
        contractEntity: (entityId: string) => contractEntity(store, entityId),

        // -- Block Manipulation --
        dragSelectedEntities:   (deltaX: number, deltaY: number) => dragSelectedEntities(store, deltaX, deltaY),
        resizeSelectedEntities: (deltaX: number, deltaY: number) => resizeSelectedEntities(store, deltaX, deltaY),
        setEntityPositions:     (entityIdsAndPositions: EntityIdAndPosition[]) => setEntityPositions(store, entityIdsAndPositions),
        deleteEntities:         (entityIds: string[]) => deleteEntities(store, entityIds),
        deleteSelectedEntities: () => deleteSelectedEntities(store),
        setEntityContent:       (entityId: string, newContent: EntityContent) => setEntityContent(store, entityId, newContent),

        // -- Block Priorities --
        setBlockPriority:    (blockId: string, higherThan: string | undefined) => setBlockPriority(store, blockId, higherThan),
        removeBlockPriority: (blockId: string) => removeBlockPriority(store, blockId),
    }
}