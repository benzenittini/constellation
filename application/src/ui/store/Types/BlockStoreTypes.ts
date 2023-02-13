
import { Block, BlockContent, BlockIdAndPosition, SearchCriteria, SearchResult } from "../../../../../common/DataTypes/BlockDataTypes";
import { BoundingBox, TypedMap } from "../../../../../common/DataTypes/GenericDataTypes";
import { AugmentedActionContext, GetterProperties } from "../StoreTypes";


// ==========
// Vuex Types
// ----------

// -- State --
export interface BlockDataState {
    blocks: TypedMap<Block>;
    blockPriorities: string[];
    expandedBlockIds: string[];
    blockIdBeingEdited: string | undefined;
}

// -- Mutations --
export type BlockDataMutations<S = BlockDataState> = {
    resetStore      (state: S): void;
    clearBoardState (state: S): void;

    addBlocks (state: S, blocks: Block[]): void;
    setBlocks (state: S, blocks: TypedMap<Block>): void;

    selectBlocks      (state: S, blockIds: string[]): void;
    deselectAllBlocks (state: S): void;
    changeEditedBlock (state: S, blockId: string | undefined): void;

    expandBlock   (state: S, blockId: string): void;
    contractBlock (state: S, blockId: string): void;

    lockOpenClosed (state: S, payload: {blockIds: string[], isLockedOpen: boolean}): void;

    moveBlocksByDelta   (state: S, payload: {blockIds: string[], deltaX: number, deltaY: number}): void;
    resizeBlocksByDelta (state: S, payload: {blockIds: string[], blockScales: TypedMap<number>, deltaX: number, deltaY: number}): void;
    setBlockPosition    (state: S, payload: {blockId: string, x: number, y: number, width: number, height: number}): void;

    deleteBlocks        (state: S, payload: {blockIds: string[]}): void;

    setBlockContent (state: S, payload: {blockId: string, newContent: BlockContent}): void;

    setBlockClassificationId (state: S, payload: {blockId: string, classificationId: string, isActive: boolean}): void;
    setBlockFieldIds         (state: S, payload: {blockId: string, fieldIds: string[]}): void;
    setBlockFieldValue       (state: S, payload: {blockId: string, fieldId: string, value: any }): void;

    // Block Priorities
    setBlockPriorities (state: S, priorities: string[]): void;
    insertBefore       (state: S, payload: {blockId: string[], before: string | undefined}): void;
    deleteEntry        (state: S, blockId: string): void;
}

// -- Actions --
export interface BlockDataActions {
    resetStore      ({ commit }: AugmentedActionContext<BlockDataState>): void;
    clearBoardState ({ commit }: AugmentedActionContext<BlockDataState>): void;

    addBlocks ({ commit }: AugmentedActionContext<BlockDataState>, blocks: Block[]): void;
    setBlocks ({ commit }: AugmentedActionContext<BlockDataState>, blocks: TypedMap<Block>): void;

    selectBlock               ({ commit }: AugmentedActionContext<BlockDataState>, payload: {blockId: string, clearCurrentSelection?: boolean}): void;
    selectBlocks              ({ commit }: AugmentedActionContext<BlockDataState>, payload: {blockIds: string[], clearCurrentSelection?: boolean}): void;
    selectBlocksByBoundingBox ({ commit }: AugmentedActionContext<BlockDataState>, payload: {boundingBox: BoundingBox, clearCurrentSelection?: boolean}): void;
    clearBlockSelection       ({ commit }: AugmentedActionContext<BlockDataState>): void;
    startEditingBlock         ({ commit }: AugmentedActionContext<BlockDataState>, blockId: string): void;
    stopEditingBlock          ({ commit }: AugmentedActionContext<BlockDataState>): void;

    lockOpenClosed ({ commit }: AugmentedActionContext<BlockDataState>, payload: {blockIds: string[]}): void;

    expandBlock   ({ commit }: AugmentedActionContext<BlockDataState>, blockId: string): void;
    contractBlock ({ commit }: AugmentedActionContext<BlockDataState>, blockId: string): void;

    dragSelectedBlocks   ({ commit }: AugmentedActionContext<BlockDataState>, payload: {deltaX: number, deltaY: number}): void;
    resizeSelectedBlocks ({ commit }: AugmentedActionContext<BlockDataState>, payload: {deltaX: number, deltaY: number}): void;
    setBlockPositions    ({ commit }: AugmentedActionContext<BlockDataState>, blockIdsAndPositions: BlockIdAndPosition[]): void;

    deleteBlocks         ({ commit }: AugmentedActionContext<BlockDataState>, blockIds: string[]): void;
    deleteSelectedBlocks ({ commit }: AugmentedActionContext<BlockDataState>): void;

    setBlockContent ({ commit }: AugmentedActionContext<BlockDataState>, payload: { blockId: string, newContent: BlockContent }): void;

    setBlockClassificationId ({ commit }: AugmentedActionContext<BlockDataState>, payload: { blockId: string, classificationId: string, isActive: boolean }): void;
    setBlockFieldIds         ({ commit }: AugmentedActionContext<BlockDataState>, payload: { blockId: string, fieldIds: string[] }): void;
    setBlockFieldValue       ({ commit }: AugmentedActionContext<BlockDataState>, payload: { blockId: string, fieldId: string, value: any }): void;

    // Block Priorities
    setBlockPriorities  ({ commit, state }: AugmentedActionContext<BlockDataState>, priorities: string[]): void;
    setBlockPriority    ({ commit, state }: AugmentedActionContext<BlockDataState>, payload: {blockId: string[], higherThan: string | undefined}): void;
    removeBlockPriority ({ commit, state }: AugmentedActionContext<BlockDataState>, blockId: string): void;
}

// -- Getters --
export type BlockDataGetters<S = BlockDataState> = {
    visibleBlocks    (state: S): TypedMap<Block>;
    selectedBlocks   (state: S): Block[];
    selectedBlockIds (state: S): string[];
    expandedBlockIds (state: S): string[];
    blockPriorities  (state: S): string[];

    blockSearch (state: S, getters: GetterProperties): (criteria: SearchCriteria) => SearchResult[];
    blockAtCoordinates(state: S, getters: GetterProperties): (coordinates: {x: number, y: number}) => Block | undefined;

    activeClassificationFieldIds (state: S, getters: GetterProperties): (blockIds: string[]) => TypedMap<string[]>;
    activeBlockFieldIds          (state: S, getters: GetterProperties): (blockIds: string[]) => string[];
    activeFieldValueCounts       (state: S, getters: GetterProperties): (blockIds: string[]) => TypedMap<{pvCounts: TypedMap<number>, outOf: number}>;

    getStyles    (state: S, getters: GetterProperties): (block: Block, depth: number) => any;
    getCssStyles (state: S, getters: GetterProperties): (block: Block, depth: number) => any;
}
