
export abstract class Action {
    abstract submit(callback?: (data: any) => void): void;
    abstract processResponse(data: any): void;
}