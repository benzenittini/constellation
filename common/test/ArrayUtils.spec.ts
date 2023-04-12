
import { expect } from 'chai';

import * as ArrayUtils from '../src/utilities/ArrayUtils';

describe('ArrayUtils', function() {

    // ================
    // arraysAreEqual()
    // ----------------

    describe('#arraysAreEqual() -- truthy cases', function() {
        [
            { arr1: undefined, arr2: undefined, eqCheck: (a: any, b: any) => a === b },
            { arr1: [],        arr2: [],        eqCheck: (a: any, b: any) => a === b },
            { arr1: [1, 2, 3], arr2: [1, 2, 3], eqCheck: (a: any, b: any) => a === b },
            { // Nonstandard equality check
                arr1: [{a: 1, b: 2}, {a: 3, b: 7}],
                arr2: [{a: 1, b: 9}, {a: 3}],
                eqCheck: (x: any, y: any) => x.a === y.a
            },
        ].forEach(({ arr1, arr2, eqCheck }) => {
            it(`${JSON.stringify(arr1)} and ${JSON.stringify(arr2)} should be equal`, function() {
                expect(ArrayUtils.arraysAreEqual(arr1, arr2, eqCheck)).to.be.true;
            });
        });
    });

    describe('#arraysAreEqual() -- falsy cases', function() {
        [
            { arr1: undefined, arr2: [], eqCheck: (a: any, b: any) => a === b },
            { arr1: [],        arr2: [1],    eqCheck: (a: any, b: any) => a === b },
            { arr1: [1, 2, 3], arr2: [2, 3], eqCheck: (a: any, b: any) => a === b },
        ].forEach(({ arr1, arr2, eqCheck }) => {
            it(`${JSON.stringify(arr1)} and ${JSON.stringify(arr2)} should not be equal`, function() {
                expect(ArrayUtils.arraysAreEqual(arr1, arr2, eqCheck)).to.be.false;
            });
        });
    });
});