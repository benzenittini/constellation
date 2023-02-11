
import axios, { AxiosRequestConfig } from 'axios';
import { Action } from "../actions/Action";
import * as ErrorLogger from '../../common/ErrorLogger';

export const HTTP_GET = 'get';
export const HTTP_POST = 'post';
export const HTTP_DELETE = 'delete';

type HttpMethod = 'get' | 'post' | 'delete';

export function send(httpMethod: HttpMethod, endpoint: string, action: Action, callback: (response: any) => void): void {
    let request: AxiosRequestConfig = {
        method: httpMethod,
        url: endpoint
    }

    if (httpMethod === HTTP_POST) {
        request.data = action.getRequestData();
    }

    axios(request)
        .then((response) => {
            callback(response);
        }).catch((error) => {
            // Unknown error.
            ErrorLogger.showError('4.2.1', [error]);
        });
}