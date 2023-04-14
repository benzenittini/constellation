
import { expect } from 'chai';

import { BooleanUtils } from '../../src/utilities';


describe('BooleanUtils', function() {

    // ===========
    // isBoolean()
    // -----------

    describe('#isBoolean()', function() {
        [
            // Boolean values
            { boo: true,    expected: true },
            { boo: false,   expected: true },
            // Non-boolean values
            { boo: 'true',  expected: false },
            { boo: 'false', expected: false },
            { boo: 0,       expected: false },
            { boo: 1,       expected: false },
            { boo: 'TRUE',  expected: false },
            { boo: [],      expected: false },
            { boo: {},      expected: false },
        ].forEach(({ boo, expected }) => {
            it(`${JSON.stringify(boo)} ${expected ? 'is' : 'is not'} a boolean value`, function() {
                expect(BooleanUtils.isBoolean(boo)).to.equal(expected);
            });
        });
    });

});