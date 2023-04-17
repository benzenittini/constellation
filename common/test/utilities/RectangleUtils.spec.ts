
import { expect } from 'chai';

import { RectangleUtils } from '../../src/utilities';


describe('RectangleUtils', function() {

    // ===========
    // normalize()
    // -----------

    describe('#normalize()', function() {
        [
            {
                orig:     {x: 0, y: 0, width: 1, height: 1},
                expected: {x: 0, y: 0, width: 1, height: 1}
            }, {
                orig:     {x: 0,  y: 0, width: -1, height: 1},
                expected: {x: -1, y: 0, width: 1,  height: 1}
            }, {
                orig:     {x: -1, y: -2, width: -3, height: -4},
                expected: {x: -4, y: -6, width: 3,  height: 4}
            }
        ].forEach(({ orig, expected }) => {
            it(`${JSON.stringify(orig)} should be normalized to ${JSON.stringify(expected)}`, function() {
                expect(RectangleUtils.normalize(orig.x, orig.y, orig.width, orig.height)).to.deep.equal(expected);
            });
        });
    });


    // ========================
    // rectangleContainsPoint()
    // ------------------------

    describe('#rectangleContainsPoint() -- truthy cases', function() {
        [
            {
                rect:  {x: 0, y: 0, width: 2, height: 2},
                point: {x: 0, y: 0}
            }, {
                rect:  {x: 0, y: 0, width: 2, height: 2},
                point: {x: 1, y: 1}
            }, {
                rect:  {x: 0, y: 0, width: 2, height: 2},
                point: {x: 2, y: 2}
            }, {
                rect:  {x: -2, y: -3, width: 4, height: 5},
                point: {x: -1, y: -2}
            }
        ].forEach(({ rect, point }) => {
            it(`${JSON.stringify(rect)} should contain the point ${JSON.stringify(point)}`, function() {
                expect(RectangleUtils.rectangleContainsPoint(rect, point)).to.be.true;
            });
        });
    });

    describe('#rectangleContainsPoint() -- falsy cases', function() {
        [
            {
                rect:  {x: 0, y: 0, width: 2, height: 2},
                point: {x: 3, y: 1}
            }, {
                rect:  {x: 0, y: 0, width: 2, height: 2},
                point: {x: 1, y: -1}
            }
        ].forEach(({ rect, point }) => {
            it(`${JSON.stringify(rect)} should NOT contain the point ${JSON.stringify(point)}`, function() {
                expect(RectangleUtils.rectangleContainsPoint(rect, point)).to.be.false;
            });
        });
    });

});