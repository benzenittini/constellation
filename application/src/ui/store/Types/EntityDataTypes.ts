
import { TypedMap } from "../../../../../common/DataTypes/GenericDataTypes";
import { AugmentedActionContext, GetterProperties } from "../StoreTypes";
import { FilterChain } from "./ViewDataTypes";


// ==========
// Vuex Types
// ----------

// -- State --
export interface EntityDataState {
    entities: TypedMap<Entity>;
    blockPriorities: string[],
    expandedEntityIds: string[];
    entityIdBeingEdited: string | undefined;
}

// -- Mutations --
export type EntityDataMutations<S = EntityDataState> = {
    resetStore      (state: S): void;
    clearBoardState (state: S): void;

    addEntities (state: S, entities: Entity[]): void;
    setEntities (state: S, entities: Entity[]): void;

    selectEntities      (state: S, entityIds: string[]): void;
    deselectAllEntities (state: S): void;
    changeEditedEntity  (state: S, entityId: string | undefined): void;

    expandEntity   (state: S, entityId: string): void;
    contractEntity (state: S, entityId: string): void;

    lockOpenClosed (state: S, payload: {entityIds: string[], isLockedOpen: boolean}): void;

    moveEntitiesByDelta   (state: S, payload: {entityIds: string[], deltaX: number, deltaY: number}): void;
    resizeEntitiesByDelta (state: S, payload: {entityIds: string[], entityScales: TypedMap<number>, deltaX: number, deltaY: number}): void;
    setEntityPosition     (state: S, payload: {entityId: string, x: number, y: number, width: number, height: number}): void;

    deleteEntities        (state: S, payload: {entityIds: string[]}): void;

    setEntityContent (state: S, payload: {entityId: string, newContent: EntityContent}): void;

    setEntityClassificationId (state: S, payload: {entityId: string, classificationId: string, isActive: boolean}): void;
    setEntityFieldIds         (state: S, payload: {entityId: string, fieldIds: string[]}): void;
    setEntityFieldValue       (state: S, payload: {entityId: string, fieldId: string, value: any }): void;

    // Block Priorities
    setBlockPriorities(state: S, priorities: string[]): void;
    insertBefore(state: S, payload: {blockId: string[], before: string | undefined}): void;
    deleteEntry(state: S, blockId: string): void;
}

// -- Actions --
export interface EntityDataActions {
    resetStore      ({ commit }: AugmentedActionContext<EntityDataState>): void;
    clearBoardState ({ commit }: AugmentedActionContext<EntityDataState>): void;

    addEntities    ({ commit }: AugmentedActionContext<EntityDataState>, entities: Entity[]): void;
    setEntities    ({ commit }: AugmentedActionContext<EntityDataState>, entities: Entity[]): void;

    selectEntity         ({ commit }: AugmentedActionContext<EntityDataState>, payload: {entityId: string, clearCurrentSelection?: boolean}): void;
    selectEntities       ({ commit }: AugmentedActionContext<EntityDataState>, payload: {entityIds: string[], clearCurrentSelection?: boolean}): void;
    clearEntitySelection ({ commit }: AugmentedActionContext<EntityDataState>): void;
    startEditingEntity   ({ commit }: AugmentedActionContext<EntityDataState>, entityId: string): void;
    stopEditingEntity    ({ commit }: AugmentedActionContext<EntityDataState>): void;

    lockOpenClosed ({ commit }: AugmentedActionContext<EntityDataState>, payload: {entityIds: string[]}): void;

    expandEntity   ({ commit }: AugmentedActionContext<EntityDataState>, entityId: string): void;
    contractEntity ({ commit }: AugmentedActionContext<EntityDataState>, entityId: string): void;

    dragSelectedEntities   ({ commit }: AugmentedActionContext<EntityDataState>, payload: {deltaX: number, deltaY: number}): void;
    resizeSelectedEntities ({ commit }: AugmentedActionContext<EntityDataState>, payload: {deltaX: number, deltaY: number}): void;
    setEntityPositions     ({ commit }: AugmentedActionContext<EntityDataState>, entityIdsAndPositions: EntityIdAndPosition[]): void;

    deleteEntities         ({ commit }: AugmentedActionContext<EntityDataState>, entityIds: string[]): void;
    deleteSelectedEntities ({ commit }: AugmentedActionContext<EntityDataState>): void;

    setEntityContent ({ commit }: AugmentedActionContext<EntityDataState>, payload: { entityId: string, newContent: EntityContent }): void;

    setEntityClassificationId ({ commit }: AugmentedActionContext<EntityDataState>, payload: { entityId: string, classificationId: string, isActive: boolean }): void;
    setEntityFieldIds         ({ commit }: AugmentedActionContext<EntityDataState>, payload: { entityId: string, fieldIds: string[] }): void;
    setEntityFieldValue       ({ commit }: AugmentedActionContext<EntityDataState>, payload: { entityId: string, fieldId: string, value: any }): void;

    // Block Priorities
    setBlockPriorities({ commit, state }: AugmentedActionContext<EntityDataState>, priorities: string[]): void;
    setBlockPriority({ commit, state }: AugmentedActionContext<EntityDataState>, payload: {blockId: string[], higherThan: string | undefined}): void;
    removeBlockPriority({ commit, state }: AugmentedActionContext<EntityDataState>, blockId: string): void;
}

// -- Getters --
export type EntityDataGetters<S = EntityDataState> = {
    visibleEntities   (state: S): TypedMap<Entity>;
    selectedEntities  (state: S): Entity[];
    selectedEntityIds (state: S): string[];
    expandedEntityIds (state: S): string[];
    blockPriorities   (state: S): string[];

    entitySearch (state: S, getters: GetterProperties): (criteria: SearchCriteria) => SearchResult[];

    activeClassificationFieldIds (state: S, getters: GetterProperties): (entityIds: string[]) => TypedMap<string[]>;
    activeEntityFieldIds         (state: S, getters: GetterProperties): (entityIds: string[]) => string[];
    activeFieldValueCounts       (state: S, getters: GetterProperties): (entityIds: string[]) => TypedMap<{pvCounts: TypedMap<number>, outOf: number}>;

    getStyles    (state: S, getters: GetterProperties): (block: Entity, depth: number) => any;
    getCssStyles (state: S, getters: GetterProperties): (block: Entity, depth: number) => any;
}


// =============
// Generic Types
// -------------

export class BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

export const DEFAULT_ENTITY_WIDTH = 200;
export const DEFAULT_ENTITY_HEIGHT = 60;
export const MIN_ENTITY_WIDTH = 75;
export const MIN_ENTITY_HEIGHT = 50;

export class Entity {
    id: string;
    location: BoundingBox;
    isSelected: boolean;
    isLockedOpen: boolean;
    content: EntityContent;

    fieldIds: string[]; // List of fields, used to determine the ordering.
    fieldValues: TypedMap<any>; // fieldIds --> values for both entity fields and classification fields
    classificationIds: string[]; // List of active classificationIds

    constructor(id: string, location: BoundingBox, content: EntityContent = {type:'text', data:{text:''}},
        fieldIds: string[] = [], fieldValues: TypedMap<any> = {}, classificationIds: string[] = []) {
        this.id = id;
        this.location = location;
        this.content = content;

        this.fieldIds = fieldIds;
        this.fieldValues = fieldValues;
        this.classificationIds = classificationIds;

        this.isSelected = false;
        this.isLockedOpen = false;
    }
}

export interface EntityIdAndPosition {
    entityId: string;
    location: {x: number, y: number, width: number, height: number};
}


// -- Entity Content Types --

export type EntityContent = TextContentType; // | AnotherType | AnotherOne

export interface TextContentType {
    type: 'text';
    data: { text: string; }
}

// -- Searching --

export type SearchCriteria = {
    searchTerm: string,
};

export type SearchResult = {
    breadcrumbs: string[],
    summaryText: string,
    entityId: string,
    block: Entity,
}