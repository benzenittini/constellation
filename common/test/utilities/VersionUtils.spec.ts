
import { expect } from 'chai';

import { VersionUtils } from '../../src/utilities';


describe('VersionUtils', function() {

    // =============
    // constructor()
    // -------------

    describe('#constructor() -- valid versions', function() {
        [
            { version: '0' },
            { version: '1.2' },
            { version: '3.0.0' },
            { version: '3.12.12345' },
        ].forEach(({ version }) => {
            it(`${version} should be a valid version`, function() {
                expect(() => new VersionUtils.Version(version)).to.not.throw();
            });
        });
    });

    describe('#constructor() -- invalid versions', function() {
        [
            { version: '' },
            { version: 'a' },
            { version: 'a.b' },
            { version: '-3.0.0' },
            { version: '3.-12.12345' },
            { version: '1.2.3-b7' },
            { version: JSON.stringify(new VersionUtils.Version('1.2.3')) },
        ].forEach(({ version }) => {
            it(`'${version}' should NOT be a valid version`, function() {
                expect(() => new VersionUtils.Version(version)).to.throw();
            });
        });
    });


    // ==========
    // asString()
    // ----------

    describe('#asString()', function() {
        [
            { version: new VersionUtils.Version('0.0.0'),   expected: '0.0.0' },
            { version: new VersionUtils.Version('1.2.3'),   expected: '1.2.3' },
            { version: new VersionUtils.Version('1'),       expected: '1' },
            { version: new VersionUtils.Version('1.2'),     expected: '1.2' },
            { version: new VersionUtils.Version('1.2.3.4'), expected: '1.2.3.4' },
        ].forEach(({ version, expected }) => {
            it(`${expected} should represent ${JSON.stringify(version)}`, function() {
                expect(version.asString()).to.equal(expected);
            });
        });
    });


    // ============
    // isLessThan()
    // ------------

    describe('#isLessThan() -- truthy cases', function() {
        [
            { version: new VersionUtils.Version('0.0.0'),   other: '0.0.1' },
            { version: new VersionUtils.Version('1.2.3'),   other: '1.3.0' },
            { version: new VersionUtils.Version('1'),       other: '2' },
            { version: new VersionUtils.Version('1.2'),     other: '1.3' },
            { version: new VersionUtils.Version('1.2.3.4'), other: '1.3.5.8' },
            { version: new VersionUtils.Version('1.3'),     other: '1.4.5' },
            { version: new VersionUtils.Version('1.2.3'),   other: '2.0' },
            { version: new VersionUtils.Version('1'),       other: '1.2' },
        ].forEach(({ version, other }) => {
            it(`${JSON.stringify(version)} should be less than ${other}`, function() {
                expect(version.isLessThan(other)).to.be.true;
            });
        });
    });

    describe('#isLessThan() -- falsy cases', function() {
        [
            { version: new VersionUtils.Version('0.0.0'),   other: '0.0.0' },
            { version: new VersionUtils.Version('1.2.3'),   other: '1.1.3' },
            { version: new VersionUtils.Version('1'),       other: '0' },
            { version: new VersionUtils.Version('1.2'),     other: '1.1' },
            { version: new VersionUtils.Version('1.2.3.4'), other: '1.1.5.8' },
            { version: new VersionUtils.Version('1.3'),     other: '1.2.5' },
            { version: new VersionUtils.Version('2.2.3'),   other: '1.9' },
            { version: new VersionUtils.Version('1.0'),     other: '1' },
        ].forEach(({ version, other }) => {
            it(`${JSON.stringify(version)} should NOT be less than ${other}`, function() {
                expect(version.isLessThan(other)).to.be.false;
            });
        });
    });

    describe('#isLessThan() -- exception cases', function() {
        [
            { version: new VersionUtils.Version('0.0.0'),   other: '0.0.-1' },
            { version: new VersionUtils.Version('0.0.0'),   other: '0.a.1' },
            { version: new VersionUtils.Version('0.0.0'),   other: '0.0.build1' },
            { version: new VersionUtils.Version('0.0.0'),   other: '' },
        ].forEach(({ version, other }) => {
            it(`'${other}' should throw an exception`, function() {
                expect(() => version.isLessThan(other)).to.throw();
            });
        });
    });


    // ========================
    // isGreaterThanOrEqualTo()
    // ------------------------

    describe('#isGreaterThanOrEqualTo() -- truthy cases', function() {
        [
            { version: new VersionUtils.Version('0.0.0'),   other: '0.0.0' },
            { version: new VersionUtils.Version('1.2.3'),   other: '1.1.3' },
            { version: new VersionUtils.Version('1'),       other: '0' },
            { version: new VersionUtils.Version('1.2'),     other: '1.1' },
            { version: new VersionUtils.Version('1.2.3.4'), other: '1.1.5.8' },
            { version: new VersionUtils.Version('1.3'),     other: '1.2.5' },
            { version: new VersionUtils.Version('2.2.3'),   other: '1.9' },
            { version: new VersionUtils.Version('1.0'),     other: '1' },
        ].forEach(({ version, other }) => {
            it(`${JSON.stringify(version)} should be greater than or equal to ${other}`, function() {
                expect(version.isGreaterThanOrEqualTo(other)).to.be.true;
            });
        });
    });

    describe('#isGreaterThanOrEqualTo() -- falsy cases', function() {
        [
            { version: new VersionUtils.Version('0.0.0'),   other: '0.0.1' },
            { version: new VersionUtils.Version('1.2.3'),   other: '1.3.0' },
            { version: new VersionUtils.Version('1'),       other: '2' },
            { version: new VersionUtils.Version('1.2'),     other: '1.3' },
            { version: new VersionUtils.Version('1.2.3.4'), other: '1.3.5.8' },
            { version: new VersionUtils.Version('1.3'),     other: '1.4.5' },
            { version: new VersionUtils.Version('1.2.3'),   other: '2.0' },
        ].forEach(({ version, other }) => {
            it(`${JSON.stringify(version)} should NOT be greater than or equal to ${other}`, function() {
                expect(version.isGreaterThanOrEqualTo(other)).to.be.false;
            });
        });
    });

    describe('#isGreaterThanOrEqualTo() -- exception cases', function() {
        [
            { version: new VersionUtils.Version('0.0.0'),   other: '0.0.-1' },
            { version: new VersionUtils.Version('0.0.0'),   other: '0.a.1' },
            { version: new VersionUtils.Version('0.0.0'),   other: '0.0.build1' },
            { version: new VersionUtils.Version('0.0.0'),   other: '' },
        ].forEach(({ version, other }) => {
            it(`'${other}' should throw an exception`, function() {
                expect(() => version.isGreaterThanOrEqualTo(other)).to.throw();
            });
        });
    });


    // ==============================
    // hasDifferentMajorVersionThan()
    // ------------------------------

    describe('#hasDifferentMajorVersionThan() -- truthy cases', function() {
        [
            { version: new VersionUtils.Version('1.2.3'), other: '2.3.4'},
            { version: new VersionUtils.Version('1.0.0'), other: '2.0.0'},
            { version: new VersionUtils.Version('5'),     other: '3'},
            { version: new VersionUtils.Version('5.4.3'), other: '3'},
        ].forEach(({ version, other }) => {
            it(`${JSON.stringify(version)} should have a different major version than ${other}`, function() {
                expect(version.hasDifferentMajorVersionThan(other)).to.be.true;
            });
        });
    });

    describe('#hasDifferentMajorVersionThan() -- falsy cases', function() {
        [
            { version: new VersionUtils.Version('2.2.3'), other: '2.3.4'},
            { version: new VersionUtils.Version('2.0.0'), other: '2.0.0'},
            { version: new VersionUtils.Version('3'),     other: '3'},
            { version: new VersionUtils.Version('3.4.3'), other: '3'},
            { version: new VersionUtils.Version('3'),     other: '3.4.3'},
        ].forEach(({ version, other }) => {
            it(`${JSON.stringify(version)} should NOT have a different major version than ${other}`, function() {
                expect(version.hasDifferentMajorVersionThan(other)).to.be.false;
            });
        });
    });

    describe('#hasDifferentMajorVersionThan() -- exception cases', function() {
        [
            { version: new VersionUtils.Version('0.0.0'),   other: '0.0.-1' },
            { version: new VersionUtils.Version('0.0.0'),   other: '0.a.1' },
            { version: new VersionUtils.Version('0.0.0'),   other: '0.0.build1' },
            { version: new VersionUtils.Version('0.0.0'),   other: '' },
        ].forEach(({ version, other }) => {
            it(`'${other}' should throw an exception`, function() {
                expect(() => version.hasDifferentMajorVersionThan(other)).to.throw();
            });
        });
    });

});