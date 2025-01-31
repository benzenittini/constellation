
import { TypedMap } from "../datatypes/GenericDataTypes";


export function arraysAreEqual(array1: any[] | undefined, array2: any[] | undefined, equalityCheck: (a: any, b: any) => boolean) {
    // Who knows, maybe they're both undefined or similarly mistyped. That probably counts as equal.
    if (array1 === array2)
        return true;

    // If they're not both undefined/null, but one is, then they're not equal.
    if (!array1 || !array2)
        return false;

    // If the lengths are different, they're not equal.
    if (array1.length !== array2.length)
        return false;

    // For each item in array 1, if it's not in array 2, they're not equal.
    for (let item of array1) {
        if (!array2.some(item2 => equalityCheck(item, item2)))
            return false;
    }

    // Ok, fine. They can be equal.
    return true;
}

/**
 * Returns an array containing only the unique items in the given array.
 * Does not work on objects (unless object refs are the same)
 */
export function unique<T = any>(array: T[], areEqual: ((a: T, b: T) => boolean) = ((a, b) => a === b)) {
    return array.filter((val1: any, index: number, self: any[]) => {
        return self.findIndex(val2 => areEqual(val1, val2)) === index;
    });
}

export function includesAny(array?: any[], items?: any[]) {
    if (array == undefined) return false;
    if (items == undefined) return false;
    return items.some(item => array.includes(item));
}

/**
 * Returns an object keyed by the array elements, and valued by the
 * number of times that occurred in the array.
 */
export function countOccurrences(array: any[]) {
    return array.reduce((counts, key) => {
        if (!counts[key])
            counts[key] = 0;
        counts[key]++;
        return counts;
    }, {});
}

/**
 * Returns an array of the most common numbers in "array". Usually just one element,
 * but ties will have multiple and empty arrays will return an empty array.
 */
export function mode(array: number[]): number[] {
    let occurrences = countOccurrences(array);
    let mode: number[] = [], count = 0;

    for (let key in occurrences) {
        if (occurrences[key] === count) {
            mode.push(parseFloat(key));
        } else if (occurrences[key] > count) {
            mode = [parseFloat(key)];
            count = occurrences[key];
        }
    }

    return mode;
}

/**
 * Modifies the original array by removing all provided "removals".
 */
export function removeEntries<T>(array: T[], removals: T[]) {
    for (let item of removals) {
        let index;
        while ((index = array.indexOf(item)) !== -1) {
            array.splice(index, 1);
        }
    }
}

/**
 * Modifies the original array by removing all instance of "item".
 */
export function removeItem(array: any[], item: any) {
    let index;
    while ((index = array.indexOf(item)) !== -1) {
        array.splice(index, 1);
    }
}

/**
 * Converts a given array of objects to a TypedMap, keying the map on a key of the objects. For example:
 * 
 * let arr = [{ id: '1', value: 'one' }, { id: '2', value: 'two' }];
 * mapify(arr, 'id');
 * 
 * ...becomes...
 * 
 * {
 *   '1': { id: '1', value: 'one' },
 *   '2': { id: '2', value: 'two' },
 * }
 */
export function mapify<T>(array: T[], keyBy: string): TypedMap<T> {
    return array.reduce((map, item) => {
        let key = (item as any)[keyBy];
        map[key] = item;
        return map;
    }, {} as TypedMap<T>);
}