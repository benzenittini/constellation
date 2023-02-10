
import { BoardData } from "../../common/BoardDataTypes";

import { BoardCommsInterface } from "./BoardCommsInterface";

export class BoardCommsLocal extends BoardCommsInterface {

    async getBoardData(boardId: string): Promise<BoardData> {
        return await window.board.getBoardData(boardId);
    }

}