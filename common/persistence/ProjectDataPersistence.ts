
import fs from 'fs';

import { BoardData } from '../DataTypes/BoardDataTypes';

export class ProjectDataPersistence {

    private sourceFile: string | undefined;

    private data: {
        boards: BoardData[],
    };

    constructor(sourceFile: string | undefined = undefined) {

        this.sourceFile = sourceFile;

        if (this.sourceFile) {
            // Get the file's data (or initialize the data if file is empty)
            let fileData: string;
            if (fs.existsSync(this.sourceFile)) {
                fileData = fs.readFileSync(this.sourceFile, 'utf8');
            } else {
                fileData = JSON.stringify(ProjectDataPersistence.getInitData());
            }
            this.data = JSON.parse(fileData);

            // Set up the autosave timer to write to the file
            setInterval(() => this.saveData(), 5000);
        } else {
            this.data = ProjectDataPersistence.getInitData();
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
            boards: [],
        };
    }


    // ================
    // Board Management
    // ----------------

    async createNewBoard(boardName: string): Promise<BoardData> {
        return {
            boardName,
        };
    }
}