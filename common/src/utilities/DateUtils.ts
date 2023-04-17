
import { DateTime } from "../datatypes/FieldDataTypes";

const months = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ];

export function formatHyphenatedYYYYMMDD(date: Date) {
    let year  = date.getUTCFullYear();
    let month = ('0' + (date.getUTCMonth()+1)).slice(-2);
    let day   = ('0' + date.getUTCDate()).slice(-2);

    return `${year}-${month}-${day}`;
}

export function formatAsYYYYMM(year: number, month: number) {
    return ('0000' + year).slice(-4) + ('00' + month).slice(-2);
}

export function formatAsMMYY(month: number, year: number) {
    return `${('00' + month).slice(-2)}/${('00' + year).slice(-2)}`;
}

// "April 23, 2022"
export function formatAsMonthDayYear(date: Date) {
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function extract24HourTime(date: Date) {
    let hours   = ('0' + (date.getHours())).slice(-2);
    let minutes = ('0' + (date.getMinutes())).slice(-2);

    return `${hours}:${minutes}`;
}

export function convertToDateTime(date: Date): DateTime {
    return {
        date: formatHyphenatedYYYYMMDD(date),
        time: extract24HourTime(date),
    };
}

/** If the date is blank, assumes today. Can override by setting "defaultDate". */
export function datetimeToMS(datetime: DateTime, defaultDate: string = formatHyphenatedYYYYMMDD(new Date())): number {
    return Date.parse(`${datetime.date || defaultDate} ${datetime.time}`);
}