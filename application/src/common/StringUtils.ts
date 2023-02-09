
export function isBlank(str: string | undefined) {
    return !str || str.trim().length == 0;
}
export function isNotBlank(str: string | undefined) {
    return !isBlank(str);
}

export function anyAreBlank(strs: (string | undefined)[] ) {
    return strs.some(str => isBlank(str));
}

// TODO-test : this function
export function isString(str: any) {
    return (typeof str === 'string' || str instanceof String);
}


// TODO-test : this function
// Taken with love from https://emailregex.com
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export function isValidEmail(email: string) {
    return EMAIL_REGEX.test(email);
}


// ===============
// Money Functions
// ---------------

// TODO-test : this function
export function formatAsUsd(cents: number) {
    let right = ('00' + (cents % 100)).slice(-2);
    let left = Math.floor(cents / 100);
    return `$ ${left}.${right}`
}


// ==============
// Date Functions
// --------------

const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

// TODO-test : this function
export function formatAsYYYYMM(year: number, month: number) {
    return year + ('00' + month).slice(-2);
}

// TODO-test : this function
export function formatAsMMYY(month: number, year: number) {
    return `${('00' + month).slice(-2)}/${('00' + year).slice(-2)}`;
}

// TODO-test : this function
// "April 23, 2022"
export function formatAsMonthDayYear(date: Date) {
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}