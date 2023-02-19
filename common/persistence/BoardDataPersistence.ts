

import fs from 'fs';

import { BoardData } from '../DataTypes/BoardDataTypes';
import { BoundingBox, TypedMap } from '../DataTypes/GenericDataTypes';
import { Block, BlockIdAndPosition } from '../DataTypes/BlockDataTypes';

export class BoardDataPersistence {

    private sourceFile: string | undefined;

    private data: BoardData;

    private saveTimer: ReturnType<typeof setTimeout> | undefined = undefined;

    constructor(sourceFile: string | undefined = undefined) {

        this.sourceFile = sourceFile;

        if (this.sourceFile) {
            // Get the file's data (or initialize the data if file is empty)
            let fileData: string;
            if (fs.existsSync(this.sourceFile)) {
                fileData = fs.readFileSync(this.sourceFile, 'utf8');
            } else {
                fileData = JSON.stringify(BoardDataPersistence.getInitData());
            }
            this.data = JSON.parse(fileData);

        } else {
            this.data = BoardDataPersistence.getInitData();
        }
    }

    /** This function should be called any time this.data is modified! */
    private scheduleSave() {
        console.log("Saving data..."); // TODO-const : delete
        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.saveData(), 5000);
    }

    private saveData() {
        if (this.sourceFile) {
            // logger.debug('Saving web data...'); // TODO-const : Logger setup
            fs.writeFileSync(this.sourceFile, JSON.stringify(this.data));
            // logger.debug('...done!'); // TODO-const : Logger setup
        }
        console.log("Data saved!"); // TODO-const : delete
    }

    static getInitData() {
        return {
            blocks: {},
            views: {},
            fields: {},
            classifications: {},
            possibleValues: {},
            blockPriorities: [],
            classificationIds: [],
        };
    }


    // =============
    // Miscellaneous
    // -------------

    async getBoardData(): Promise<BoardData> {
        return this.data;
    }


    // ==========
    // Block CRUD
    // ----------

    async createBlock(blockId: string, location: BoundingBox, parentBlockId: string | undefined): Promise<Block> {
        // If specified, make sure the parent block exists
        if (parentBlockId && this.data.blocks[parentBlockId] === undefined) {
            // TODO-const : error handling
            // throw new TopError('3.3.13', Severity.MEDIUM,
            //     `When creating a new block, the specified parentBlockId does not exist. boardId: ${boardId}, blockId: ${blockId}, parentBlockId: ${parentBlockId}`,
            //     UserErrors.INTERNAL_ERROR);
            throw new Error('error in createBlock: parent block does not exist');
        }

        // Make sure there isn't a duplicate blockId
        if (this.data.blocks[blockId]) {
            // TODO-const : error handling
            // throw new TopError('3.3.14', Severity.MEDIUM,
            //     `When creating a new block, the specified block ID already exists. boardId: ${boardId}, blockId: ${blockId}, parentBlockId: ${parentBlockId}`,
            //     UserErrors.INTERNAL_ERROR);
            throw new Error('error in createBlock: block id already exists');
        }

        // All good! Add and persist the block.
        let newBlock = new Block(blockId, location, parentBlockId);
        this.data.blocks[blockId] = newBlock;
        this.data.blockPriorities.push(blockId);

        this.scheduleSave();

        return newBlock;
    }

    async updateBlockPositions(blockIdsAndPositions: BlockIdAndPosition[]): Promise<BlockIdAndPosition[]> {
        for (let {blockId, location} of blockIdsAndPositions) {
            this.data.blocks[blockId].location = location;
        }

        this.scheduleSave();

        return blockIdsAndPositions;
    }

    async deleteBlocks(blockIds: string[]): Promise<string[]> {
        // Get all the decendants (and depths) of the given blockId - needed to re-scale blocks later on.
        let originalDescendents = await this.getBlockDescendents(blockIds);
        let originalDepths      = await this.getBlockDepths(Array.from(originalDescendents));

        // Update the parent block IDs of all the deleted blocks' children.
        for (let block of Object.values(this.data.blocks)) {
            // Traverse up the chain of parentBlockIds until we arrive at one that either isn't deleted, or is undefined.
            // That'll be this block's new parent.
            let newParentId = block.parentBlockId;
            while (newParentId && blockIds.includes(newParentId)) {
                newParentId = this.data.blocks[newParentId].parentBlockId;
            }
            block.parentBlockId = newParentId;
        }

        // Remove the blocks from existence
        for (let blockId of blockIds) {
            delete this.data.blocks[blockId];
            let index = this.data.blockPriorities.indexOf(blockId);
            if (index !== -1) {
                this.data.blockPriorities.splice(index, 1);
            }
        }

        // Determine the new depth of each descendant, and update its size appropriately
        let newDescendents = Array.from(originalDescendents).filter(od => !blockIds.includes(od.id));
        let newDepths      = await this.getBlockDepths(Array.from(newDescendents));
        await this.adjustBlockSizes(originalDepths, newDepths);

        this.scheduleSave();

        return blockIds;
    }

    async setBlockParent(blockId: string, parentBlockId: string | undefined): Promise<void> {
        // Validation
        if (blockId === undefined) {
            // TODO-const : Error handling
            throw new Error("Error in setBlockParent: requested blockId cannot be undefined.");
        } else if (blockId !== undefined && !this.data.blocks[blockId]) {
            // TODO-const : Error handling
            throw new Error("Error in setBlockParent: requested blockId doesn't exist.");
        } else if (parentBlockId !== undefined && !this.data.blocks[parentBlockId]) {
            // TODO-const : Error handling
            throw new Error("Error in setBlockParent: requested parentBlockId doesn't exist.");
        }

        // Get all the decendants (and depths) of the given blockId
        let originalDescendents = await this.getBlockDescendents([blockId]);
        let originalDepths      = await this.getBlockDepths(Array.from(originalDescendents));

        // Update the hierarchy - first verify we don't have a circular reference by traversing up the hierarchy
        let currentBlockId: string | undefined = parentBlockId;
        while (currentBlockId !== undefined) {
            currentBlockId = this.data.blocks[currentBlockId].parentBlockId;
            // If we ever return to the original entity, then we're caught in a loop. Abandon ship!
            if (currentBlockId === blockId) {
                // TODO-const : Error handling
                throw new Error("Error in setBlockParent: circular dependency detected!");
            }
        }
        this.data.blocks[blockId].parentBlockId = parentBlockId;

        // Determine the new depth of each descendant, and update its size appropriately
        let newDescendents = await this.getBlockDescendents([blockId]);
        let newDepths      = await this.getBlockDepths(Array.from(newDescendents));
        await this.adjustBlockSizes(originalDepths, newDepths);

        // The data's dirty!
        this.scheduleSave();
    }

    async getBlockDescendents(parentIds: string[]): Promise<Set<Block>> {
        // Short-circuit if able
        if (parentIds.length === 0) {
            return new Set<Block>();
        }

        // We only track each block's parentId, which is very inconvenient for finding descendents.
        // Let's build up a list of each block's children for convenience and (hopefully) efficiency.
        let blockChildren: TypedMap<string[]> = {}; // Parent Id --> Children Ids
        Object.values(this.data.blocks).forEach(b => {
            if (b.parentBlockId) {
                blockChildren[b.parentBlockId] ??= [];
                blockChildren[b.parentBlockId].push(b.id);
            }
        });

        // Fetch and return the Blocks
        let descendents = new Set<Block>();
        let blocksToCheck = [...parentIds]; // Copying to prevent modifying the passed-in parameter on the caller.
        for (let blockId of blocksToCheck) {
            descendents.add(this.data.blocks[blockId]);
            blockChildren[blockId]?.forEach(b => blocksToCheck.push(b));
        }
        return descendents;
    }

    async getBlockDepths(blocks: Block[]): Promise<TypedMap<number>> {
        let depths: TypedMap<number> = {};

        for (let block of blocks) {
            let depth = 1;
            let parentId = block.parentBlockId;
            while (parentId !== undefined) {
                depth++;
                parentId = this.data.blocks[parentId]?.parentBlockId;
            }
            depths[block.id] = depth;
        }

        return depths;
    }

    async adjustBlockSizes(originalDepths: TypedMap<number>, newDepths: TypedMap<number>): Promise<void> {
        // Build up a list of blockIdsAndPositions to update
        let blockIdsAndPositions: BlockIdAndPosition[] = [];
        for (let blockId in newDepths) {
            // For each layer deep, we want to multiply its scale by 1.5.
            // Depth of 1 == scale 1
            // Depth of 2 == scale 1 * 1.5
            // Depth of 3 == scale 1 * 1.5 * 1.5
            // Depth of n == scale 1 * Math.pow(1.5, n-1)
            let originalScale = 1 * Math.pow(1.5, originalDepths[blockId]-1);
            let newScale      = 1 * Math.pow(1.5, newDepths[blockId]-1);

            let block = this.data.blocks[blockId];
            blockIdsAndPositions.push({
                blockId: block.id,
                location: {
                    ...block.location,
                    width:  block.location.width  * originalScale / newScale,
                    height: block.location.height * originalScale / newScale
                }
            });
        }

        // Do the update!
        await this.updateBlockPositions(blockIdsAndPositions);
    }

}