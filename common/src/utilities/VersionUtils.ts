import { ConstError } from "../datatypes/ActionDataTypes";

export const VALID_REGEX = /^\d+(\.\d+)*$/;

export class Version {

    private version: string;
    private segments: number[];

    constructor(version: string) {
        if (!VALID_REGEX.test(version)) {
            throw new ConstError(2, undefined,
                ConstError.getLineId('VersionUtils', 'constructor', 1),
                `Provided version failed to parse: ${version}`);
        }
        this.version = version;
        this.segments = version.split('.').map(str => parseInt(str, 10));
    }

    asString(): string {
        return this.version;
    }

    isLessThan(other: string): boolean {
        if (!VALID_REGEX.test(other)) {
            throw new ConstError(2, undefined,
                ConstError.getLineId('VersionUtils', 'isLessThan', 1),
                `Provided version failed to parse: ${other}`);
        }
        let otherSegments = other.split('.').map(str => parseInt(str, 10));
        for (let x = 0; x < this.segments.length; x++) {
            if (this.segments[x] < otherSegments[x]) {
                return true;
            }
            if (this.segments[x] > otherSegments[x]) {
                return false;
            }
        }

        // If this version ran out of digits before otherSegments did, then other segments must be a larger version.
        if (this.segments.length < otherSegments.length) {
            return true;
        }

        // If they have the same number of digits, and those digits are all equal, then they're identical (which isn't less than)
        return false;
    }

    isGreaterThanOrEqualTo(other: string): boolean {
        return !this.isLessThan(other);
    }

    hasDifferentMajorVersionThan(other: string): boolean {
        if (!VALID_REGEX.test(other)) {
            throw new ConstError(2, undefined,
                ConstError.getLineId('VersionUtils', 'hasDifferentMajorVersionThan', 1),
                `Provided version failed to parse: ${other}`);
        }
        let otherSegments = other.split('.').map(str => parseInt(str, 10));

        // If the first digit is different, return true.
        if (otherSegments[0] !== this.segments[0]) {
            return true;
        }

        // Otherwise, false.
        return false;
    }

}
