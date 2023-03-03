
export abstract class Action {
    abstract submit(callback?: (data: any) => void): void;
}