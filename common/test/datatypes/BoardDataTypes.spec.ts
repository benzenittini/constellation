
import { expect } from 'chai';

import { Block, verifyBoardData } from '../../src/datatypes';


const validBoard = {
    // Lookup Maps
    blocks: {
        'a': new Block('a', {x: 1, y: 2, width: 3, height: 4}),
    },
    views: {
        'v': { id: 'v', name: 'view', type: 'FILTER', filter: { filters: [], conjunction: 'AND' } },
    },
    fields: {
        'f': { id: 'f', name: 'field', type: 'Textbox', possibleValueIds: [], sourceType: 'block'},
    },
    classifications: {
        'b': { id: 'c', name: 'cName', fieldIds: [] },
    },
    possibleValues: {
        'p': { id: 'p', name: 'possibleValue' },
    },
    // Used to determine ordering
    blockPriorities: ['a'],
    classificationIds: ['b'],
};

describe('BoardDataTypes', function() {

    // =================
    // verifyBoardData()
    // -----------------

    describe('#verifyBoardData()', function() {
        [
            // Fully-populated
            { expected: true,  data: { ...validBoard } },
            // Optional values removed
            { expected: true,  data: { ...validBoard, blocks: {}, classifications: {}, blockPriorities: [], classificationIds: []} },
            // Required values removed
            { expected: false, data: { ...validBoard, blocks: {} } },
            { expected: false, data: { ...validBoard, classifications: {} } },
            { expected: false, data: { ...validBoard, blocks: undefined } },
            { expected: false, data: { ...validBoard, views: undefined } },
            { expected: false, data: { ...validBoard, fields: undefined } },
            { expected: false, data: { ...validBoard, classifications: undefined } },
            { expected: false, data: { ...validBoard, possibleValues: undefined } },
            { expected: false, data: { ...validBoard, blockPriorities: undefined } },
            { expected: false, data: { ...validBoard, classificationIds: undefined } },
            // Invalid value types
            { expected: false, data: { ...validBoard, blocks: 7 } },
            { expected: false, data: { ...validBoard, blocks: 'a' } },
            { expected: false, data: { ...validBoard, blocks: { 'a': {} } } },
            { expected: false, data: { ...validBoard, views: 7 } },
            { expected: false, data: { ...validBoard, views: 'v' } },
            { expected: false, data: { ...validBoard, views: { 'v': {} } } },
            { expected: false, data: { ...validBoard, fields: 7 } },
            { expected: false, data: { ...validBoard, fields: 'f' } },
            { expected: false, data: { ...validBoard, fields: { 'f': {} } } },
            { expected: false, data: { ...validBoard, classifications: 7 } },
            { expected: false, data: { ...validBoard, classifications: 'b' } },
            { expected: false, data: { ...validBoard, classifications: { 'b': {} } } },
            { expected: false, data: { ...validBoard, possibleValues: 7 } },
            { expected: false, data: { ...validBoard, possibleValues: 'p' } },
            { expected: false, data: { ...validBoard, possibleValues: { 'p': {} } } },
            { expected: false, data: { ...validBoard, blockPriorities: 7 } },
            { expected: false, data: { ...validBoard, blockPriorities: 'bp' } },
            { expected: false, data: { ...validBoard, blockPriorities: {} } },
            { expected: false, data: { ...validBoard, blockPriorities: [{}] } },
            { expected: false, data: { ...validBoard, classificationIds: 7 } },
            { expected: false, data: { ...validBoard, classificationIds: 'b' } },
            { expected: false, data: { ...validBoard, classificationIds: {} } },
            { expected: false, data: { ...validBoard, classificationIds: [{}] } },
            { expected: false, data: {} },
            { expected: false, data: undefined },
        ].forEach(({ data, expected }) => {
            it(`should correctly identify a BoardData datatype.`, function() {
                expect(verifyBoardData(data)).to.equal(expected);
            });
        });
    });

});