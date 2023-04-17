
import { expect } from 'chai';

import { ObjectUtils } from '../../src/utilities';


describe('ObjectUtils', function() {

    // ==================
    // isObjectWithKeys()
    // ------------------

    describe('#isObjectWithKeys() -- truthy cases', function() {
        [
            { obj: {},               keys: [] },
            { obj: {a: 'a', b: 'b'}, keys: [] },
            { obj: {a: 'a', b: 'b'}, keys: ['a'] },
            { obj: {a: 'a', b: 'b'}, keys: ['a', 'b'] },
        ].forEach(({ obj, keys }) => {
            it(`${JSON.stringify(obj)} should have the keys ${keys}`, function() {
                expect(ObjectUtils.isObjectWithKeys(obj, keys)).to.be.true;
            });
        });
    });

    describe('#isObjectWithKeys() -- falsy cases', function() {
        [
            { obj: {},               keys: ['cat'] },
            { obj: {a: 'a', b: 'b'}, keys: ['cat'] },
            { obj: {a: 'a', b: 'b'}, keys: ['a', 'b', 'c'] },
            { obj: 'cat',            keys: [] },
            { obj: 7,                keys: [] },
        ].forEach(({ obj, keys }) => {
            it(`${JSON.stringify(obj)} should NOT have the keys ${keys}`, function() {
                expect(ObjectUtils.isObjectWithKeys(obj, keys)).to.be.false;
            });
        });
    });

    // ========
    // isObject
    // --------

    describe('#isObject() -- truthy cases', function() {
        [
            { obj: {} },
            { obj: {a: 'a', b: 'b'} },
            { obj: new Object() },
            { obj: [1, 2, 3] },
        ].forEach(({ obj }) => {
            it(`${JSON.stringify(obj)} should be an object`, function() {
                expect(ObjectUtils.isObject(obj)).to.be.true;
            });
        });
    });

    describe('#isObject() -- falsy cases', function() {
        [
            { obj: 7   },
            { obj: 'a' },
            { obj: undefined },
            { obj: null },
        ].forEach(({ obj }) => {
            it(`${JSON.stringify(obj)} should NOT be an object`, function() {
                expect(ObjectUtils.isObject(obj)).to.be.false;
            });
        });
    });

    // ==========
    // areEqual()
    // ----------

    describe('#areEqual() -- truthy cases', function() {
        [
            { obj1: {},               obj2: {} },
            { obj1: {a: 'a', b: 'b'}, obj2: {a: 'a', b: 'b'} },
            { obj1: new Object(),     obj2: new Object() },
            { obj1: [1, 2, 3],        obj2: [1, 2, 3] },
            { obj1: 'a',              obj2: 'a' },
            { obj1: 7,                obj2: 7 },
            { obj1: undefined,        obj2: undefined },
            { obj1: null,             obj2: null },
            { obj1: new Object(),     obj2: {} },
            { obj1: [],               obj2: {} },
        ].forEach(({ obj1, obj2 }) => {
            it(`${JSON.stringify(obj1)} should equal ${JSON.stringify(obj2)}`, function() {
                expect(ObjectUtils.areEqual(obj1, obj2)).to.be.true;
            });
        });
    });

    describe('#areEqual() -- falsy cases', function() {
        [
            { obj1: {},               obj2: {a: 'a'} },
            { obj1: {a: 'a', b: 'b'}, obj2: {a: 'a', c: 'c'} },
            { obj1: [1, 2, 3],        obj2: {a: 'a'} },
            { obj1: 'a',              obj2: 7 },
            { obj1: null,             obj2: undefined },
            { obj1: null,             obj2: {} },
            { obj1: {},               obj2: undefined },
        ].forEach(({ obj1, obj2 }) => {
            it(`${JSON.stringify(obj1)} should NOT equal ${JSON.stringify(obj2)}`, function() {
                expect(ObjectUtils.areEqual(obj1, obj2)).to.be.false;
            });
        });
    });

});