
import { expect } from 'chai';

import { Block, DEFAULT_BLOCK_CONTENT, verifyBlock, verifyBlockContent } from '../../src/datatypes';

const validBlock = {
    id: 'bid',
    location: { x: 0, y: 0, width: 0, height: 0 },
    content: { type: 'text', data: { text: 'hello' }},

    fieldValues: { 'a': 'hello' },
    fieldIds: [ 'a' ],
    classificationIds: [ 'a' ],

    parentBlockId: 'pid',

    isSelected: true,
    isLockedOpen: true,
};

describe('BlockDataTypes', function() {

    // =============
    // verifyBlock()
    // -------------

    describe('#verifyBlock()', function() {
        [
            // Fully-populated
            { expected: true,  data: {...validBlock} },
            // Optional values removed
            { expected: true,  data: {...validBlock, parentBlockId: undefined} },
            { expected: true,  data: {...validBlock, isSelected: undefined} },
            { expected: true,  data: {...validBlock, isLockedOpen: undefined} },
            // Required values removed
            { expected: false, data: {...validBlock, id: undefined} },
            { expected: false, data: {...validBlock, location: undefined} },
            { expected: false, data: {...validBlock, content: undefined} },
            { expected: false, data: {...validBlock, fieldValues: undefined} },
            { expected: false, data: {...validBlock, fieldIds: undefined} },
            { expected: false, data: {...validBlock, classificationIds: undefined} },
            // Invalid value types
            { expected: false, data: {...validBlock, id: 1} },
            { expected: false, data: {...validBlock, location: 1} },
            { expected: false, data: {...validBlock, content: { text: 'hello' }} },
            { expected: false, data: {...validBlock, fieldValues: 1} },
            { expected: false, data: {...validBlock, fieldIds: 1} },
            { expected: false, data: {...validBlock, fieldIds: [1]} },
            { expected: false, data: {...validBlock, classificationIds: 1} },
            { expected: false, data: {...validBlock, classificationIds: [1]} },
            { expected: false, data: {...validBlock, parentBlockId: 1} },
            { expected: false, data: {...validBlock, isSelected: 1} },
            { expected: false, data: {...validBlock, isLockedOpen: 1} },
            { expected: false, data: {} },
            { expected: false, data: undefined },
        ].forEach(({ data, expected }) => {
            it(`should correctly identify a block datatype.`, function() {
                expect(verifyBlock(data)).to.equal(expected);
            });
        });
    });


    // ====================
    // verifyBlockContent()
    // --------------------

    describe('#verifyBlockContent()', function() {
        [
            // Fully-populated
            { expected: true,  data: { type: 'text', data: { text: 'hello' }} },
            // Failure cases
            { expected: false, data: { type: 'other', data: { text: 'hello' }} },
            { expected: false, data: { type: 'text', data: { content: 'hello' }} },
            { expected: false, data: { type: 'text', data: undefined} },
            { expected: false, data: {} },
            { expected: false, data: undefined },
            { expected: false, data: null },
        ].forEach(({ data, expected }) => {
            it(`should correctly identify a block's contents datatype.`, function() {
                expect(verifyBlockContent(data)).to.equal(expected);
            });
        });
    });

});

describe('Block', function() {

    // =============
    // constructor()
    // -------------

    describe('#constructor()', function() {
        it(`should instantiate with the bare number of parameters`, function() {
            let underTest = new Block('asdf', {x: 1, y: 2, width: 3, height: 4});
            expect(underTest.id).to.equal('asdf');
            expect(underTest.location).to.deep.equal({x: 1, y: 2, width: 3, height: 4});
            expect(underTest.parentBlockId).to.be.undefined;
            expect(underTest.content).to.deep.equal({type: 'text', data: { text: ''}});
            expect(underTest.fieldValues).to.deep.equal({});
            expect(underTest.classificationIds).to.deep.equal([]);
            expect(underTest.fieldIds).to.deep.equal([]);
            expect(underTest.isSelected).to.be.undefined
            expect(underTest.isLockedOpen).to.be.undefined;
        });
    });

    describe('#constructor()', function() {
        it(`should instantiate with the full number of parameters`, function() {
            let underTest = new Block('asdf', {x: 1, y: 2, width: 3, height: 4}, 'qwer', {type: 'text', data: { text: 'hello' }}, {a: 'b'}, ['c'], ['d']);
            expect(underTest.id).to.equal('asdf');
            expect(underTest.location).to.deep.equal({x: 1, y: 2, width: 3, height: 4});
            expect(underTest.parentBlockId).to.equal('qwer');
            expect(underTest.content).to.deep.equal({type: 'text', data: { text: 'hello'}});
            expect(underTest.fieldValues).to.deep.equal({a: 'b'});
            expect(underTest.classificationIds).to.deep.equal(['c']);
            expect(underTest.fieldIds).to.deep.equal(['d']);
            expect(underTest.isSelected).to.be.undefined
            expect(underTest.isLockedOpen).to.be.undefined;
        });
    });

});