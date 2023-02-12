

import fs from 'fs';

import { BoardData } from '../DataTypes/BoardDataTypes';

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
        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.saveData(), 5000);
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
            views: {},
            fields: {},
            classifications: {},
            possibleValues: {},
            blockPriorities: [],
            classificationIds: [],
        };
    }


    // ================
    // Category!
    // ----------------

    async getBoardData(): Promise<BoardData> {
        return this.data;
    }
}