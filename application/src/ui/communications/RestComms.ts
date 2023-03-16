
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as ErrorLogger from '../../common/ErrorLogger';

export const HTTP_GET    = 'get';
export const HTTP_POST   = 'post';
export const HTTP_PUT    = 'put';
export const HTTP_DELETE = 'delete';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

export function send<T>({httpMethod, baseUrl, endpoint, data, creds, callback}: {
    httpMethod: HttpMethod,
    baseUrl: string,
    endpoint: string,
    data?: any,
    creds?: string,
    callback: (response: AxiosResponse<T, any>) => void
}): void {
    let request: AxiosRequestConfig = {
        method: httpMethod,
        baseURL: baseUrl,
        url: endpoint,
    }

    if (creds) {
        request.headers = { "Authorization" : `Bearer ${creds}` };
    }

    if ([HTTP_POST, HTTP_PUT].includes(httpMethod)) {
        request.data = data;
    }

    axios(request)
        .then((response) => {
            callback(response);
        }).catch((error) => {
            // Unknown error.
            ErrorLogger.showError('4.2.1', [error]);
        });
}
