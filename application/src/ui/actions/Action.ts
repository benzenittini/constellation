
import { ErrorResponse, GENERIC_RESTART } from 'constellation-common/datatypes';
import { E0, showError } from "../ErrorLogger";


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