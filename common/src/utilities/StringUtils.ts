import { ConstError } from "../datatypes/ActionDataTypes";

export function isBlank(str: string | undefined) {
    return !str || str.trim().length == 0;
}

export function anyAreBlank(strs: (string | undefined)[] ) {
    return strs.some(str => isBlank(str));
}

export function isString(str: any) {
    return (typeof str === 'string');
}


// Taken with love from https://emailregex.com
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export function isValidEmail(email: string) {
    return EMAIL_REGEX.test(email);
}


// ===============
// Money Functions
// ---------------

export function formatAsUsd(cents: number) {
    if (!Number.isInteger(cents)) {
        throw new ConstError(2, undefined,
            ConstError.getLineId('StringUtils', 'formatAsUsd', 1),
            `Provided cents must be a whole number. (given: ${cents})`);
    }

    let right = ('00' + (cents % 100)).slice(-2);
    let left = Math.trunc(cents / 100);
    return `$ ${left}.${right}`;
}
