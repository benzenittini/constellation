
import { expect } from 'chai';

import { DateUtils } from '../../src/utilities';


describe('DateUtils', function() {

    // ==========================
    // formatHyphenatedYYYYMMDD()
    // --------------------------

    describe('#formatHyphenatedYYYYMMDD()', function() {
        [
            { date: new Date('January 1, 2023'),   expected: '2023-01-01' },
            { date: new Date('December 31, 2023'), expected: '2023-12-31' },
            { date: new Date(1681485050368),       expected: '2023-04-14' },
        ].forEach(({ date, expected }) => {
            it(`${JSON.stringify(date)} reformatted should be ${expected}`, function() {
                expect(DateUtils.formatHyphenatedYYYYMMDD(date)).to.equal(expected);
            });
        });
    });


    // ===================
    // extract24HourTime()
    // -------------------

    describe('#extract24HourTime()', function() {
        [
            { date: new Date('January 1, 2023, 4:00 PM'),   expected: '16:00' },
            { date: new Date('December 31, 2023, 4:02 AM'), expected: '04:02' },
            { date: new Date('December 31, 2023, 4:40 AM'), expected: '04:40' },
            { date: new Date('December 31, 2023, 4:43 AM'), expected: '04:43' },
            { date: new Date('December 31, 2023'),          expected: '00:00' },
            { date: new Date(1681485050368),                expected: '11:10' },
        ].forEach(({ date, expected }) => {
            it(`${JSON.stringify(date)} has the time ${expected}`, function() {
                expect(DateUtils.extract24HourTime(date)).to.equal(expected);
            });
        });
    });


    // ===================
    // convertToDateTime()
    // -------------------

    describe('#convertToDateTime()', function() {
        [
            { date: new Date('January 1, 2023, 4:00 PM'),   expected: { date: '2023-01-01', time: '16:00' }},
            { date: new Date('December 31, 2023, 4:02 AM'), expected: { date: '2023-12-31', time: '04:02' }},
            { date: new Date('December 31, 2023, 4:40 AM'), expected: { date: '2023-12-31', time: '04:40' }},
            { date: new Date('December 31, 2023, 4:43 AM'), expected: { date: '2023-12-31', time: '04:43' }},
            { date: new Date('December 31, 2023'),          expected: { date: '2023-12-31', time: '00:00' }},
            { date: new Date(1681485050368),                expected: { date: '2023-04-14', time: '11:10' }},
        ].forEach(({ date, expected }) => {
            it(`${JSON.stringify(date)} has the date/time ${JSON.stringify(expected)}`, function() {
                expect(DateUtils.convertToDateTime(date)).to.deep.equal(expected);
            });
        });
    });


    // ==============
    // dateTimeToMS()
    // --------------

    describe('#dateTimeToMs()', function() {
        [
            { dateTime: { date: '2023-01-01', time: '04:00' }, defaultDate: undefined,    expected: 1672563600000 },
            { dateTime: { date: '2023-01-01', time: '04:00' }, defaultDate: '2022-10-31', expected: 1672563600000 },
            { dateTime: { date: '',           time: '04:00' }, defaultDate: '2022-10-31', expected: 1667203200000 },
        ].forEach(({ dateTime, defaultDate, expected }) => {
            it(`${JSON.stringify(dateTime)} converts to ${expected}ms`, function() {
                expect(DateUtils.datetimeToMS(dateTime, defaultDate)).to.equal(expected);
            });
        });
    });

});