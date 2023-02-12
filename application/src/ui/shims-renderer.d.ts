
/** Tells typescript what properties are available on the global "window" object. Useful for preloads. */
interface Window {
    project: {
        getRecentBoards: any,
        createNewBoard: any,
        getRemoteProjects: any,
    },
    board: {
        getBoardData: any,
    },
}