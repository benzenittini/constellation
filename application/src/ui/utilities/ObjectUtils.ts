
export function isObjectWithKeys(obj: any, keys: string[]): boolean {
    // If undefined, return false.
    if (!obj) return false;

    // Check for each key, returning false if not present.
    for (let key of keys) {
        if (obj[key] === undefined) return false;
    }

    // ...guess it must have all the keys then, huh?
    return true;
}

// Ugh. https://stackoverflow.com/questions/8511281/check-if-a-value-is-an-object-in-javascript
export function isObject(obj: any): boolean {
    return obj === Object(obj);
}

export function areEqual(a: any, b: any): boolean {
    // If neither is an object, then just compare directly.
    if (!isObject(a) && !isObject(b)) {
        return a === b;
    }

    // If one is an object and the other is not, then not equal.
    if ((isObject(a) && !isObject(b)) || (!isObject(a) && isObject(b))) {
        return false;
    }

    // If both are objects, then check number of keys...
    if (Object.keys(a).length !== Object.keys(b).length)
        return false;

    // ...and the values of those keys.
    for (let key of Object.keys(a)) {
        if (a[key] !== b[key])
            return false;
    }

    return true;
}
