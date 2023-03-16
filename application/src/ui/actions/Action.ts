
import { ErrorResponse } from "../../../../common/DataTypes/ActionDataTypes";
import { E0, GENERIC_RESTART, showError } from "../../common/ErrorLogger";


export abstract class Action {

    protected errorCallback: (error: ErrorResponse) => void = (error) => {
        showError(E0, [error.message || GENERIC_RESTART]);
    };
    protected successCallback?: (response: any) => void;

    onError(callback: (error: ErrorResponse) => void) {
        this.errorCallback = callback;
        return this;
    }

    onSuccess<T>(callback: (response: T) => void) {
        this.successCallback = callback;
        return this;
    }

    abstract submit(): void;
}