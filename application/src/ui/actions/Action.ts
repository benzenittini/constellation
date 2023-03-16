import { ErrorResponse } from "../../../../common/DataTypes/ActionDataTypes";

export abstract class Action {

    protected errorCallback?: (error: ErrorResponse) => void;
    protected successCallback?: (response: any) => void;

    onError(callback: (error: ErrorResponse) => void) {
        this.errorCallback = callback;
        return this;
    }

    onSuccess<T>(callback: (response: T) => void) {
        this.successCallback = callback;
        return this;
    }

    abstract submit(callback?: (data: any) => void): void;
}