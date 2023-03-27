
import path from "path";
import fs from 'fs';

import { BoardData, TemplateClassification } from "../../common/DataTypes/BoardDataTypes";
import { TypedMap } from "../../common/DataTypes/GenericDataTypes";
import { BoardDataPersistence } from "../../common/persistence/BoardDataPersistence";
import { ProjectDataPersistence } from "./ProjectDataPersistence";
import { properties } from "./PropertyLoader";
import { DOT_FILE_SUFFIX } from "../../common/Constants";


export let projectDataPersistence: ProjectDataPersistence | undefined = undefined;
export let boardDataPersistence: TypedMap<BoardDataPersistence> = {};


export async function initializePersistence(filepath: string) {
    projectDataPersistence = new ProjectDataPersistence(filepath);

    // Initialize the existing boards
    let projectData = await projectDataPersistence.getBasicProjectData()
    Object.values(projectData.boards).forEach(board => {
        addBoardPersistence(board.boardId);
    });
}

export function addBoardPersistence(boardId: string, template?: TemplateClassification[]) {
    boardDataPersistence[boardId] = new BoardDataPersistence(
        path.resolve(properties.board_dir, boardId + DOT_FILE_SUFFIX),
        BoardDataPersistence.getInitData(template));
}

export function importBoardPersistence(boardId: string, initialData: BoardData) {
    boardDataPersistence[boardId] = new BoardDataPersistence(
        path.resolve(properties.board_dir, boardId + DOT_FILE_SUFFIX),
        initialData);
}

export function deleteBoardPersistence(boardId: string) {
    delete boardDataPersistence[boardId];
    const file = path.resolve(properties.board_dir, boardId + DOT_FILE_SUFFIX);
    if (fs.existsSync(file)) {
        fs.rmSync(file);
    }
}

