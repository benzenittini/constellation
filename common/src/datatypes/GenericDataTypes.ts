
export type TypedMap<T> = { [key: string]: T }


export type BoundingBox = {
    x: number,
    y: number,
    width: number,
    height: number,
}

/** Converts the provided data into an object, casting it as that type. Useful for verification methods. */
export function parseAs<T>(data: any): T | false {
    if (typeof data === 'object') {
        return data;
    }
    try { return JSON.parse(data); }
    catch (err) { return false; }
}