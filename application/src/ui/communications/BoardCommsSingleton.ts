
import { BoardCommsInterface } from "./BoardCommsInterface";
import { BoardCommsLocal } from "./BoardCommsLocal";
import { BoardCommsRemote } from "./BoardCommsRemote";


class BoardComms {

    public activeInterface?: BoardCommsInterface;

    activateLocalInterface() {
        this.activeInterface = new BoardCommsLocal();
    }

    activateRemoteInterface(/* remote params go here */) {
        this.activeInterface = new BoardCommsRemote(/* remote params go here */);
    }

}

export const BoardCommsSingleton = new BoardComms();