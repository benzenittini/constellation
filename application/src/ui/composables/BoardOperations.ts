
import { reactive } from 'vue';
import { useVueModals } from 'mw-vue-modals';

import { BoardData, GENERIC_RESTART, LOCAL_PROJECT, TemplateClassification } from 'constellation-common/datatypes';
import { CreateNewBoardAction } from '../actions/project-actions/CreateNewBoard';
import { E10, E4, E5, E6, E8, showError } from '../ErrorLogger';
import { DeleteBoardAction } from '../actions/project-actions/DeleteBoard';
import { ImportBoardAction } from '../actions/project-actions/ImportBoard';
import { useStore } from '../store/store';


// =========
// Variables
// ---------

const CREATE_BOARD_DIALOG_ID  = 'create-board-dialog';
const IMPORT_BOARD_DIALOG_ID  = 'import-board-dialog';
const DELETE_BOARD_DIALOG_ID  = 'delete-board-dialog';

const store = useStore();


// =========
// Functions
// ---------

function createBoard(projectId: string) {
    type CreateBoardModalData = {
        projectId: string,
        saveData: { boardName: string, fileName: string, classifications: TemplateClassification[] },
    };
    let modalData: CreateBoardModalData = reactive(JSON.parse(JSON.stringify({
        projectId,
        saveData: { boardName: '', fileName: '', classifications: [] },
    })));

    let mwVueModals = useVueModals();
    mwVueModals.createOrUpdateModal({
        id: CREATE_BOARD_DIALOG_ID,
        styleOverrides: {
            'width': '650px',
        },
        layout: {
            componentName: 'mw-vm-fixed-bottom',
            panes: {
                'bottom': {
                    componentName: 'eic-savecancel',
                    componentData: { mwSaveText: 'Create Board' },
                    eventHandlers: {
                        'mw-cancel':  (event: any) => { mwVueModals.closeModal(CREATE_BOARD_DIALOG_ID); },
                        'mw-save':  (event: any) => {
                            let { boardName, fileName, classifications } = modalData.saveData;
                            let boardOrFileName = (boardName !== '') ? boardName : fileName;
                            if (boardOrFileName && boardOrFileName.trim() !== '') {
                                new CreateNewBoardAction(
                                    projectId,
                                    JSON.parse(JSON.stringify(classifications)),
                                    boardOrFileName,
                                ).onSuccess(() => {
                                    mwVueModals.closeModal(CREATE_BOARD_DIALOG_ID);
                                }).onError((error) => {
                                    showError(E4, [error.message || GENERIC_RESTART]);
                                }).submit();
                            } else {
                                showError(E5, [projectId === LOCAL_PROJECT ? 'Filename' : 'Board name']);
                            }
                        },
                    }
                },
                'main': {
                    componentName: 'eic-create-board-dialog',
                    componentData: modalData,
                    styleOverrides: {
                        'max-height': '500px',
                    },
                    eventHandlers: {
                    }
                }
            }
        }
    });
}

function deleteBoard(projectId: string, boardId: string) {
    type DeleteBoardModalData = {
        saveData: { projectId: string, boardId: string, deleteFile?: boolean },
    };
    let modalData: DeleteBoardModalData = reactive(JSON.parse(JSON.stringify({
        saveData: { projectId, boardId, deleteFile: false },
    })));

    const mwVueModals = useVueModals();
    mwVueModals.createOrUpdateModal({
        id: DELETE_BOARD_DIALOG_ID,
        styleOverrides: {
            'width': '650px',
        },
        layout: {
            componentName: 'mw-vm-fixed-bottom',
            panes: {
                'bottom': {
                    componentName: 'eic-savecancel',
                    componentData: { mwSaveText: 'Yes' },
                    eventHandlers: {
                        'mw-cancel':  (event: any) => { mwVueModals.closeModal(DELETE_BOARD_DIALOG_ID); },
                        'mw-save':  (event: any) => {
                            let { projectId, boardId, deleteFile } = modalData.saveData;
                            new DeleteBoardAction(projectId, boardId, deleteFile)
                                .onSuccess(   () => mwVueModals.closeModal(DELETE_BOARD_DIALOG_ID))
                                .onError((error) => showError(E6, [error.message || GENERIC_RESTART]))
                                .submit();
                        },
                    }
                },
                'main': {
                    componentName: 'eic-delete-board-dialog',
                    componentData: modalData,
                    styleOverrides: {
                        'max-height': '500px',
                    },
                    eventHandlers: {
                    }
                }
            }
        }
    });
}

function importBoard(projectId: string) {
    if (projectId === LOCAL_PROJECT) {
        new ImportBoardAction(projectId)
            .onError(error => {
                if (error.errorCode === 3) {
                    // Error code 3 indicates user closed window without choosing file.
                    // No need to display any problems.
                } else {
                    showError(E8, [error.message || GENERIC_RESTART]);
                }
            }).submit();
    } else {
        // For remote projects, we need both the file data and a board name ... so launching a dialog.
        type ImportBoardModalData = {
            saveData: { boardName: string, initialData?: BoardData },
        };
        let modalData: ImportBoardModalData = reactive(JSON.parse(JSON.stringify({
            saveData: { boardName: '' },
        })));

        let mwVueModals = useVueModals();
        mwVueModals.createOrUpdateModal({
            id: IMPORT_BOARD_DIALOG_ID,
            styleOverrides: {
                'width': '650px',
            },
            layout: {
                componentName: 'mw-vm-fixed-bottom',
                panes: {
                    'bottom': {
                        componentName: 'eic-savecancel',
                        componentData: { mwSaveText: 'Import Board' },
                        eventHandlers: {
                            'mw-cancel': (event: any) => { mwVueModals.closeModal(IMPORT_BOARD_DIALOG_ID); },
                            'mw-save':  (event: any) => {
                                let { boardName, initialData } = modalData.saveData;
                                new ImportBoardAction(
                                    projectId,
                                    boardName,
                                    JSON.parse(JSON.stringify(initialData)),
                                ).onSuccess(resp => {
                                    mwVueModals.closeModal(IMPORT_BOARD_DIALOG_ID);
                                }).onError(error => {
                                    showError(E10, [error.message || GENERIC_RESTART]);
                                }).submit();
                            },
                        }
                    },
                    'main': {
                        componentName: 'eic-import-board-dialog',
                        componentData: modalData,
                        styleOverrides: {
                            'max-height': '500px',
                        },
                        eventHandlers: {
                        }
                    }
                }
            }
        });
    }
}

function openBoard(projectId: string, boardId: string) {
    store.dispatch('setCurrentProjectBoard', { projectId, boardId });
}

export function useBoardOperations() {

    return {
        createBoard,
        deleteBoard,
        importBoard,
        openBoard,
    };
}