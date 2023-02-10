
import { BoardData } from "../../common/BoardDataTypes";

export abstract class BoardCommsInterface {

    abstract getBoardData(boardId: string): Promise<BoardData>;

}
