
import path from "path";
import fs from 'fs';

import { TemplateClassification } from "../../common/DataTypes/BoardDataTypes";
import { TypedMap } from "../../common/DataTypes/GenericDataTypes";
import { BoardDataPersistence } from "../../common/persistence/BoardDataPersistence";
import { ProjectDataPersistence } from "./ProjectDataPersistence";
import { properties } from "./PropertyLoader";


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
        path.resolve(properties.board_dir, boardId + ".mw"),
        BoardDataPersistence.getInitData(template));
}

export function deleteBoardPersistence(boardId: string) {
    delete boardDataPersistence[boardId];
    const file = path.resolve(properties.board_dir, boardId + ".mw");
    if (fs.existsSync(file)) {
        fs.rmSync(file);
    }
}

