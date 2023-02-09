
export abstract class Action {
    abstract getRequestData(): any;
    abstract submit(callback: (response: any) => void): void;
    abstract processResponse(callback: (response: any) => void): void;
}