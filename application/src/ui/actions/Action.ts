
export abstract class Action {
    abstract getRequestData(): any;
    abstract submit(): void;
    abstract processResponse(data: any): void;
}