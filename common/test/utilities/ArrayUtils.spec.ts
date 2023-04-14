
import { expect } from 'chai';

import { ArrayUtils } from '../../src/utilities';

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
            { arr1: undefined, arr2: [],        eqCheck: (a: any, b: any) => a === b },
            { arr1: [],        arr2: [1],       eqCheck: (a: any, b: any) => a === b },
            { arr1: [1, 2, 3], arr2: [2, 3],    eqCheck: (a: any, b: any) => a === b },
            { arr1: [1, 2, 3], arr2: [2, 3, 4], eqCheck: (a: any, b: any) => a === b },
        ].forEach(({ arr1, arr2, eqCheck }) => {
            it(`${JSON.stringify(arr1)} and ${JSON.stringify(arr2)} should NOT be equal`, function() {
                expect(ArrayUtils.arraysAreEqual(arr1, arr2, eqCheck)).to.be.false;
            });
        });
    });


    // ========
    // unique()
    // --------

    describe('#unique()', function() {
        [
            { arr: [],                   expected: [] },
            { arr: [1, 2, 3, 1],         expected: [1, 2, 3] },
            { arr: ['a', 'b', 'c', 'c'], expected: ['a', 'b', 'c'] },
            { arr: [true, false, false], expected: [true, false] },
        ].forEach(({ arr, expected }) => {
            it(`unique(${JSON.stringify(arr)}) should return ${JSON.stringify(expected)}`, function() {
                expect(ArrayUtils.unique(arr)).to.deep.equal(expected);
            });
        });
    });


    // =============
    // includesAny()
    // -------------

    describe('#includesAny() -- truthy cases', function() {
        [
            { arr1: [1],       arr2: [1] },
            { arr1: [1, 2, 3], arr2: [2, 4] },
            { arr1: ['a', 'b', 'c'], arr2: ['c', 'e', 'f'] },
        ].forEach(({ arr1, arr2 }) => {
            it(`${JSON.stringify(arr1)} should include one of ${JSON.stringify(arr2)}`, function() {
                expect(ArrayUtils.includesAny(arr1, arr2)).to.be.true;
            });
        });
    });

    describe('#includesAny() -- falsy cases', function() {
        [
            { arr1: undefined, arr2: [] },
            { arr1: undefined, arr2: undefined },
            { arr1: [],        arr2: undefined },
            { arr1: [],        arr2: [] },
            { arr1: [],        arr2: [1] },
            { arr1: [1, 2, 3], arr2: [4, 5] },
            { arr1: [1, 2, 3], arr2: [] },
            { arr1: ['a', 'b', 'c'], arr2: ['d', 'e'] },
        ].forEach(({ arr1, arr2 }) => {
            it(`${JSON.stringify(arr1)} should NOT include one of ${JSON.stringify(arr2)}`, function() {
                expect(ArrayUtils.includesAny(arr1, arr2)).to.be.false;
            });
        });
    });


    // ==================
    // countOccurrences()
    // ------------------

    describe('#countOccurrences()', function() {
        [
            { arr: [],                        expected: {} },
            { arr: [1, 2, 3, 1],              expected: { 1: 2, 2: 1, 3: 1 } },
            { arr: ['a', 'c', 'b', 'c', 'c'], expected: { 'a': 1, 'c': 3, 'b': 1 } },
            { arr: [true, false, false],      expected: { true: 1, false: 2 } },
        ].forEach(({ arr, expected }) => {
            it(`countOccurrences(${JSON.stringify(arr)}) should return ${JSON.stringify(expected)}`, function() {
                expect(ArrayUtils.countOccurrences(arr)).to.deep.equal(expected);
            });
        });
    });


    // ======
    // mode()
    // ------

    describe('#mode()', function() {
        [
            { arr: [],           expected: [] },
            { arr: [1, 2, 3, 1], expected: [1] },
            { arr: [1, 2, 2, 1], expected: [1, 2] },
        ].forEach(({ arr, expected }) => {
            it(`mode(${JSON.stringify(arr)}) should return ${JSON.stringify(expected)}`, function() {
                expect(ArrayUtils.mode(arr)).to.deep.equal(expected);
            });
        });
    });


    // ===============
    // removeEntries()
    // ---------------

    describe('#removeEntries()', function() {
        [
            { arr: [],                   remove: [1, 2],     expected: [] },
            { arr: [1, 2, 3, 1],         remove: [2, 3],     expected: [1, 1] },
            { arr: [1, 2, 3, 1],         remove: [4, 5],     expected: [1, 2, 3, 1] },
            { arr: [1, 2, 3, 1],         remove: [],         expected: [1, 2, 3, 1] },
            { arr: ['a', 'b', 'c', 'c'], remove: ['b', 'c'], expected: ['a'] },
        ].forEach(({ arr, remove, expected }) => {
            it(`removeEntries(${JSON.stringify(arr)}) should return ${JSON.stringify(expected)}`, function() {
                // Modifies the original array.
                ArrayUtils.removeEntries((arr as any), (remove as any));
                expect(arr).to.deep.equal(expected);
            });
        });
    });


    // ============
    // removeItem()
    // ------------

    describe('#removeItem()', function() {
        [
            { arr: [],                   remove: 1,   expected: [] },
            { arr: [1, 2, 3, 1],         remove: 2,   expected: [1, 3, 1] },
            { arr: [1, 2, 3, 1],         remove: 4,   expected: [1, 2, 3, 1] },
            { arr: ['a', 'b', 'c', 'c'], remove: 'c', expected: ['a', 'b'] },
        ].forEach(({ arr, remove, expected }) => {
            it(`removeItem(${JSON.stringify(arr)}) should return ${JSON.stringify(expected)}`, function() {
                // Modifies the original array.
                ArrayUtils.removeItem((arr as any), (remove as any));
                expect(arr).to.deep.equal(expected);
            });
        });
    });


    // ========
    // mapify()
    // --------

    describe('#mapify()', function() {
        [
            {
                arr: [{a:'3', key:'1'}, {a:'4', key:'2'}],
                keyBy: 'key',
                expected: {
                    '1': {a:'3', key:'1'},
                    '2': {a:'4', key:'2'},
                }
            }, {
                arr: [{a:'3', key:'1'}, {a:'4'}],
                keyBy: 'key',
                expected: {
                    '1': {a:'3', key:'1'},
                    'undefined': {a:'4'},
                }
            }
        ].forEach(({ arr, keyBy, expected }) => {
            it(`mapify(${JSON.stringify(arr)}) should return ${JSON.stringify(expected)}`, function() {
                expect(ArrayUtils.mapify(arr, keyBy)).to.deep.equal(expected);
            });
        });
    });

});