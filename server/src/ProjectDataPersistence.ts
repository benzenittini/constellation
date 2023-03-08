
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

import { BasicBoardData, BasicProjectData } from '../../common/DataTypes/BoardDataTypes';
import { properties } from './PropertyLoader';
import { mapify } from '../../common/utilities/ArrayUtils';

import * as T from '../../common/DataTypes/ActionDataTypes';

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
            this.saveData();
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

    async createNewBoard({ boardOrFileName }: T.CreateNewBoardRequest): Promise<T.CreateNewBoardResponse> {
        let board = {
            boardId: uuidv4(),
            boardName: boardOrFileName,
        };
        this.data.boards.push(board);

        this.saveData();

        return board;
    }

    async deleteBoard({ boardId }: T.DeleteBoardRequest): Promise<T.DeleteBoardResponse> {
        let index = this.data.boards.findIndex(board => board.boardId === boardId);

        if (index === -1) {
            return {
                wasSuccessful: false,
                boardId,
                projectId: this.data.projectId,
            };
        }
        this.data.boards.splice(index, 1);

        this.saveData();

        return {
            wasSuccessful: true,
            boardId,
            projectId: this.data.projectId,
        }
    }

    async updateBoardConfig(boardId: string, { boardConfig }: T.UpdateBoardConfigRequest): Promise<T.UpdateBoardConfigResponse> {
        let board = this.data.boards.find(b => b.boardId === boardId);
        if (!board) return { wasSuccessful: false };

        board.boardName = boardConfig.name;

        this.saveData();

        return {
            wasSuccessful: true,
            projectId: this.data.projectId,
            boardId,
            boardConfig
        };
    }
}