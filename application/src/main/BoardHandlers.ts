
export async function getBoardData(boardId: string) {
    console.log("returning board data for " + boardId);
    return {
        boardId,
        blocks: [],
    };
}