
import { BoardData } from "../../common/BoardDataTypes";

import { BoardCommsInterface } from "./BoardCommsInterface";

export class BoardCommsRemote extends BoardCommsInterface {

    async getBoardData(boardId: string): Promise<BoardData> {
        return {};
    }

}