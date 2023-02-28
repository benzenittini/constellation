
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { BasicBoardData, BasicProjectData } from '../../common/DataTypes/BoardDataTypes';
import { properties } from './PropertyLoader';
import { mapify } from '../../common/utilities/ArrayUtils';

export class ProjectDataPersistence {

    private sourceFile: string | undefined;

    private data: {
        projectId: string,
        boards: { boardId: string, boardName: string }[],
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
        } else {
            this.data = ProjectDataPersistence.getInitData();
        }
    }

    private saveData() {
        if (this.sourceFile) {
            // logger.debug('Saving web data...'); // TODO-const : Logger setup
            fs.writeFileSync(this.sourceFile, JSON.stringify(this.data));
            console.log("Project data saved!");
            // logger.debug('...done!'); // TODO-const : Logger setup
        }
    }

    static getInitData() {
        return {
            projectId: uuidv4(),
            boards: [],
        };
    }


    // ========
    // Handlers
    // --------

    async getBasicProjectData(): Promise<BasicProjectData> {
        return {
            projectId: this.data.projectId,
            projectName: properties.project_name,
            boards: mapify<BasicBoardData>(this.data.boards, 'boardId'),
        };
    }

    async createNewBoard(boardName: string): Promise<void> {
        // TODO-const : ProjectDataPersistence.createNewBoard
        this.saveData();
    }
}