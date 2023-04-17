
import { expect } from 'chai';

import { StringUtils } from '../../src/utilities';


describe('StringUtils', function() {

    // =========
    // isBlank()
    // ---------

    describe('#isBlank() -- truthy cases', function() {
        [
            { str: '' },
            { str: ' ' },
            { str: '  ' },
            { str: '\n' },
            { str: undefined },
        ].forEach(({ str }) => {
            it(`${JSON.stringify(str)} should be blank`, function() {
                expect(StringUtils.isBlank(str)).to.be.true;
            });
        });
    });

    describe('#isBlank() -- falsy cases', function() {
        [
            { str: 'nope' },
            { str: ' hi ' },
            { str: '\nhello' },
        ].forEach(({ str }) => {
            it(`${JSON.stringify(str)} should NOT be blank`, function() {
                expect(StringUtils.isBlank(str)).to.be.false;
            });
        });
    });


    // =============
    // anyAreBlank()
    // -------------

    describe('#anyAreBlank() -- truthy cases', function() {
        [
            { str: ['', 'cat'] },
            { str: ['cat', ' '] },
            { str: ['  ', 'cat'] },
            { str: ['\n', '  '] },
            { str: [undefined, '\n', 'blue'] },
        ].forEach(({ str }) => {
            it(`${JSON.stringify(str)} has at least one blank`, function() {
                expect(StringUtils.anyAreBlank(str)).to.be.true;
            });
        });
    });

    describe('#anyAreBlank() -- falsy cases', function() {
        [
            { str: ['nope', 'maybe'] },
            { str: [' hi '] },
            { str: ['\nhello', 'there\n'] },
        ].forEach(({ str }) => {
            it(`${JSON.stringify(str)} should NOT have at least one blank`, function() {
                expect(StringUtils.anyAreBlank(str)).to.be.false;
            });
        });
    });


    // ==========
    // isString()
    // ----------

    describe('#isString() -- truthy cases', function() {
        [
            { str: '' },
            { str: ' ' },
            { str: '  ' },
            { str: '\n' },
            { str: 'Am I a string? Yes. Technically.' },
        ].forEach(({ str }) => {
            it(`${JSON.stringify(str)} should be a string`, function() {
                expect(StringUtils.isString(str)).to.be.true;
            });
        });
    });

    describe('#isString() -- falsy cases', function() {
        [
            { str: undefined },
            { str: null },
            { str: 123 },
            { str: { 'cat': 'dog' } },
            { str: [ 'not', 'a', 'string' ] },
        ].forEach(({ str }) => {
            it(`${JSON.stringify(str)} should NOT be a string`, function() {
                expect(StringUtils.isString(str)).to.be.false;
            });
        });
    });


    // ==============
    // isValidEmail()
    // --------------

    describe('#isValidEmail() -- truthy cases', function() {
        [
            { str: 'ben@zenittini.dev' },
            { str: 'cat@gmail.com' },
        ].forEach(({ str }) => {
            it(`${JSON.stringify(str)} should be a valid email`, function() {
                expect(StringUtils.isValidEmail(str)).to.be.true;
            });
        });
    });

    describe('#isValidEmail() -- falsy cases', function() {
        [
            { str: '' },
            { str: ' ' },
            { str: ' ben@zenittini.dev' },
            { str: 'ben@zenittini.dev ' },
            { str: 'cat@' },
            { str: '@gmail.com' },
            { str: 'cat@gmail' },
            { str: 'me@1.2.3.4' },
        ].forEach(({ str }) => {
            it(`${JSON.stringify(str)} should NOT be a valid email`, function() {
                expect(StringUtils.isValidEmail(str)).to.be.false;
            });
        });
    });


    // =============
    // formatAsUsd()
    // -------------

    describe('#formatAsUsd()', function() {
        [
            { cents: 0,     expected: '$ 0.00' },
            { cents: 123,   expected: '$ 1.23' },
            { cents: 12345, expected: '$ 123.45' },
            { cents: -12345, expected: '$ -123.45' },
        ].forEach(({ cents, expected }) => {
            it(`'${cents}' should be represented by '${expected}'`, function() {
                expect(StringUtils.formatAsUsd(cents)).to.equal(expected);
            });
        });
    });

    describe('#formatAsUsd() -- exception cases', function() {
        [
            { cents: -12345.76 },
        ].forEach(({ cents }) => {
            it(`'${cents}' should throw an exception`, function() {
                expect(() => StringUtils.formatAsUsd(cents)).to.throw();
            });
        });
    });

});