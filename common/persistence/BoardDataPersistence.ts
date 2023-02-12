

import fs from 'fs';

import { TypedMap } from '../DataTypes/GenericDataTypes';
import { Block, BoardData } from '../DataTypes/BoardDataTypes';

export class BoardDataPersistence {

    private sourceFile: string | undefined;

    private data: {
        blocks: TypedMap<Block>,
    };

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

            // Set up the autosave timer to write to the file
            setInterval(() => this.saveData(), 5000);
        } else {
            this.data = BoardDataPersistence.getInitData();
        }
    }

    private saveData() {
        if (this.sourceFile) {
            // logger.debug('Saving web data...'); // TODO-const : Logger setup
            fs.writeFileSync(this.sourceFile, JSON.stringify(this.data));
            // logger.debug('...done!'); // TODO-const : Logger setup
        }
    }

    static getInitData() {
        return {
            blocks: {},
        };
    }


    // ================
    // Category!
    // ----------------

    async functionthatdoesathing(boardName: string): Promise<void> {
        // return {
        //     boardName,
        // };
    }
}