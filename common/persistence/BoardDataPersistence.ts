

import fs from 'fs';

import { BoardData } from '../DataTypes/BoardDataTypes';
import { BoundingBox } from '../DataTypes/GenericDataTypes';
import { Block } from '../DataTypes/BlockDataTypes';

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
}