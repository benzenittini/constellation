

// TODO-test this whole file

import { DateTime } from "../../../common/DataTypes/FieldDataTypes";

export function formatHyphenatedYYYYMMDD(date: Date) {
    let year  = date.getUTCFullYear();
    let month = ('0' + (date.getUTCMonth()+1)).slice(-2);
    let day   = ('0' + date.getUTCDate()).slice(-2);

    return `${year}-${month}-${day}`;
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