
import { expect } from 'chai';

import { ConstError } from '../../src/datatypes';
import { ObjectUtils, StringUtils } from '../../src/utilities';

describe('ConstError', function() {

    // =============
    // constructor()
    // -------------

    describe('#constructor()', function() {
        [
            { clientCode: 1, clientMessage: 'cm',      lineId: 'line1', serverMessage: 'sm', wrappedError: new Error("wrapped") },
            { clientCode: 1, clientMessage: 'cm',      lineId: 'line1', serverMessage: 'sm', wrappedError: "wrapped" },
            { clientCode: 1, clientMessage: undefined, lineId: 'line1', serverMessage: 'sm', wrappedError: undefined },
        ].forEach(({ clientCode, clientMessage, lineId, serverMessage, wrappedError }) => {
            it(`should correctly assign class variables`, function() {
                let underTest = new ConstError(clientCode, clientMessage, lineId, serverMessage, wrappedError);

                expect(underTest.clientCode).to.equal(clientCode);
                expect(underTest.clientMessage).to.equal(clientMessage);
                expect(underTest.serverMessage).to.contain(serverMessage);
                if (wrappedError && wrappedError instanceof Error) {
                    expect(underTest.serverMessage).to.contain(wrappedError.stack);
                } else if (wrappedError) {
                    expect(underTest.serverMessage).to.contain(wrappedError);
                }
                expect(underTest.message).to.contain(lineId);
                expect(underTest.message).to.contain(underTest.serverMessage);
            });
        });
    });


    // ==================
    // getErrorResponse()
    // ------------------

    describe('#getErrorResponse()', function() {
        [
            { clientCode: 1, clientMessage: 'client message' },
            { clientCode: 1, clientMessage: undefined },
        ].forEach(({ clientCode, clientMessage }) => {
            it(`should contain both the errorCode and message`, function() {
                let underTest = new ConstError(clientCode, clientMessage, 'line1', 'server message', undefined);

                expect(underTest.getErrorResponse()).to.deep.equal({
                    errorCode: clientCode,
                    message: clientMessage
                });
            });
        });
    });


    // =================
    // safeConstructor()
    // -----------------

    describe('#safeConstructor()', function() {
        it(`shouldn't modify a ConstError`, function() {
            let err = new ConstError(1, 'client message', 'line1', 'server message');
            let underTest = ConstError.safeConstructor(err);

            expect(underTest).to.equal(err);
        });

        it(`should wrap a normal error in a ConstError`, function() {
            let err = new Error('normal error');
            let underTest = ConstError.safeConstructor(err);

            expect(underTest).to.not.equal(err);
            expect(underTest instanceof ConstError).to.be.true;
            expect(underTest.message).to.contain(err.stack);
        });
    });


    // ===========
    // getLineId()
    // -----------

    describe('#getLineId()', function() {
        it(`should be properly formatted`, function() {
            let underTest = ConstError.getLineId('file1', 'func1', 1);
            expect(underTest).to.equal('file1.func1:1');
        });
    });

});