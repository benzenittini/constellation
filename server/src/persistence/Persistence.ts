
import path from "path";
import fs from 'fs';

import { TypedMap, BoardData, TemplateClassification } from 'constellation-common/datatypes';
import { Constants } from 'constellation-common/utilities';
import { BoardDataPersistence } from "constellation-common/persistence";
import { ProjectDataPersistence } from "./ProjectDataPersistence";
import { properties } from "../utilities/PropertyLoader";
import { singleton as WebsocketSingleton } from "../communications/WebsocketManager";


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
    const sourceFilepath = path.resolve(properties.board_dir, boardId + Constants.DOT_FILE_SUFFIX);
    const backupFilepath = path.resolve(properties.backup_dir, boardId + Constants.DOT_FILE_SUFFIX);
    boardDataPersistence[boardId] = new BoardDataPersistence(sourceFilepath, backupFilepath, BoardDataPersistence.getInitData(template));
}

export function importBoardPersistence(boardId: string, initialData: BoardData) {
    const sourceFilepath = path.resolve(properties.board_dir, boardId + Constants.DOT_FILE_SUFFIX);
    const backupFilepath = path.resolve(properties.backup_dir, boardId + Constants.DOT_FILE_SUFFIX);
    boardDataPersistence[boardId] = new BoardDataPersistence(sourceFilepath, backupFilepath, initialData);
}

export function deleteBoardPersistence(boardId: string) {
    WebsocketSingleton.sendToAllClients('boardDeleted', {}, boardId);
    delete boardDataPersistence[boardId];
    const file = path.resolve(properties.board_dir, boardId + Constants.DOT_FILE_SUFFIX);
    if (fs.existsSync(file)) {
        fs.rmSync(file);
    }
}

