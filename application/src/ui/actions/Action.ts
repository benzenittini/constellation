
export abstract class Action {
    abstract getRequestData(): any;
    abstract submit(callback?: (data: any) => void): void;
    abstract processResponse(data: any): void;
}