
/** Tells typescript what properties are available on the global "window" object. Useful for preloads. */
interface Window {
    projects: {
        getProjectsAndBoards: any,
    },
    board: {
        getBoardData: any,
    },
}