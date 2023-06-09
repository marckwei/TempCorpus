function gc() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
}

function noInline() {
}

function OSRExit() {
}

function ensureArrayStorage() {
}

function fiatInt52(i) {
	return i;
}

function noDFG() {
}

function noOSRExitFuzzing() {
}

function isFinalTier() {
	return true;
}

function transferArrayBuffer() {
}

function fullGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function edenGC() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function forceGCSlowPaths() {
	if (gc !== undefined) 
		gc();
	else
		CollectGarbage();
}

function noFTL() {

}

function debug(x) {
	console.log(x);
}

function describe(x) {
	console.log(x);
}

function isInt32(i) {
	return (typeof i === "number");
}

function BigInt(i) {
	return i;
}

if (typeof(console) == "undefined") {
    console = {
        log: print
    };
}

if (typeof(gc) == "undefined") {
  gc = function() {
    for (let i = 0; i < 10; i++) {
      new ArrayBuffer(1024 * 1024 * 10);
    }
  }
}

if (typeof(BigInt) == "undefined") {
  BigInt = function (v) { return new Number(v); }
}

if (typeof(BigInt64Array) == "undefined") {
  BigInt64Array = function(v) { return new Array(v); }
}

if (typeof(BigUint64Array) == "undefined") { 
  BigUint64Array = function (v) { return new Array(v); }
}

if (typeof(quit) == "undefined") {
  quit = function() {
  }
}

/* The contents of this file are subject to the Netscape Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/NPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * The Original Code is Mozilla Communicator client code, released March
 * 31, 1998.
 *
 * The Initial Developer of the Original Code is Netscape Communications
 * Corporation. Portions created by Netscape are
 * Copyright (C) 1998 Netscape Communications Corporation. All
 * Rights Reserved.
 *
 * Contributor(s): 
 * 
 */
/**
    File Name:          15.9.5.36-1.js
    ECMA Section:       15.9.5.36 Date.prototype.setFullYear(year [, mon [, date ]] )
    Description:

    If mon is not specified, this behaves as if mon were specified with the
    value getMonth( ). If date is not specified, this behaves as if date were
    specified with the value getDate( ).

   1.   Let t be the result of LocalTime(this time value); but if this time
        value is NaN, let t be +0.
   2.   Call ToNumber(year).
   3.   If mon is not specified, compute MonthFromTime(t); otherwise, call
        ToNumber(mon).
   4.   If date is not specified, compute DateFromTime(t); otherwise, call
        ToNumber(date).
   5.   Compute MakeDay(Result(2), Result(3), Result(4)).
   6.   Compute UTC(MakeDate(Result(5), TimeWithinDay(t))).
   7.   Set the [[Value]] property of the this value to TimeClip(Result(6)).
   8.   Return the value of the [[Value]] property of the this value.

    Author:             christine@netscape.com
    Date:               12 november 1997

    Added test cases for Year 2000 Compatilibity Testing.

*/
    var SECTION = "15.9.5.36-1";
    var VERSION = "ECMA_1";
    startTest();

    writeHeaderToLog( SECTION + " Date.prototype.setFullYear(year [, mon [, date ]] )");

    getTestCases();
    test();

function test() {
    for ( tc=0; tc < testcases.length; tc++ ) {
        testcases[tc].passed = writeTestCaseResult(
                            testcases[tc].expect,
                            testcases[tc].actual,
                            testcases[tc].description +" = "+
                            testcases[tc].actual );

        testcases[tc].reason += ( testcases[tc].passed ) ? "" : "wrong value ";
    }
    stopTest();
    return ( testcases );
}
function getTestCases() {
    // feb 29, 2000
    addNewTestCase( "TDATE = new Date(0);(TDATE).setFullYear(2000);TDATE",
                    UTCDateFromTime(SetFullYear(0,2000)),
                    LocalDateFromTime(SetFullYear(0,2000)) );

    addNewTestCase( "TDATE = new Date(0);(TDATE).setFullYear(2000,1);TDATE",
                    UTCDateFromTime(SetFullYear(0,2000,1)),
                    LocalDateFromTime(SetFullYear(0,2000,1)) );

    addNewTestCase( "TDATE = new Date(0);(TDATE).setFullYear(2000,1,29);TDATE",
                    UTCDateFromTime(SetFullYear(0,2000,1,29)),
                    LocalDateFromTime(SetFullYear(0,2000,1,29)) );

/*
    // Jan 1, 2005
    addNewTestCase( "TDATE = new Date(0);(TDATE).setFullYear(2005);TDATE",
                    UTCDateFromTime(SetFullYear(0,2005)),
                    LocalDateFromTime(SetFullYear(0,2005)) );

    addNewTestCase( "TDATE = new Date(0);(TDATE).setFullYear(2005,0);TDATE",
                    UTCDateFromTime(SetFullYear(0,2005,0)),
                    LocalDateFromTime(SetFullYear(0,2005,0)) );

    addNewTestCase( "TDATE = new Date(0);(TDATE).setFullYear(2005,0,1);TDATE",
                    UTCDateFromTime(SetFullYear(0,2005,0,1)),
                    LocalDateFromTime(SetFullYear(0,2005,0,1)) );

*/
}
function addNewTestCase( DateString, UTCDate, LocalDate) {
    DateCase = eval( DateString );

    var item = testcases.length;

//    fixed_year = ( ExpectDate.year >=1900 || ExpectDate.year < 2000 ) ? ExpectDate.year - 1900 : ExpectDate.year;

    testcases[item++] = new TestCase( SECTION, DateString+".getTime()",             UTCDate.value,       DateCase.getTime() );
    testcases[item++] = new TestCase( SECTION, DateString+".valueOf()",             UTCDate.value,       DateCase.valueOf() );

    testcases[item++] = new TestCase( SECTION, DateString+".getUTCFullYear()",      UTCDate.year,    DateCase.getUTCFullYear() );
    testcases[item++] = new TestCase( SECTION, DateString+".getUTCMonth()",         UTCDate.month,  DateCase.getUTCMonth() );
    testcases[item++] = new TestCase( SECTION, DateString+".getUTCDate()",          UTCDate.date,   DateCase.getUTCDate() );
    testcases[item++] = new TestCase( SECTION, DateString+".getUTCDay()",           UTCDate.day,    DateCase.getUTCDay() );
    testcases[item++] = new TestCase( SECTION, DateString+".getUTCHours()",         UTCDate.hours,  DateCase.getUTCHours() );
    testcases[item++] = new TestCase( SECTION, DateString+".getUTCMinutes()",       UTCDate.minutes,DateCase.getUTCMinutes() );
    testcases[item++] = new TestCase( SECTION, DateString+".getUTCSeconds()",       UTCDate.seconds,DateCase.getUTCSeconds() );
    testcases[item++] = new TestCase( SECTION, DateString+".getUTCMilliseconds()",  UTCDate.ms,     DateCase.getUTCMilliseconds() );

    testcases[item++] = new TestCase( SECTION, DateString+".getFullYear()",         LocalDate.year,       DateCase.getFullYear() );
    testcases[item++] = new TestCase( SECTION, DateString+".getMonth()",            LocalDate.month,      DateCase.getMonth() );
    testcases[item++] = new TestCase( SECTION, DateString+".getDate()",             LocalDate.date,       DateCase.getDate() );
    testcases[item++] = new TestCase( SECTION, DateString+".getDay()",              LocalDate.day,        DateCase.getDay() );
    testcases[item++] = new TestCase( SECTION, DateString+".getHours()",            LocalDate.hours,      DateCase.getHours() );
    testcases[item++] = new TestCase( SECTION, DateString+".getMinutes()",          LocalDate.minutes,    DateCase.getMinutes() );
    testcases[item++] = new TestCase( SECTION, DateString+".getSeconds()",          LocalDate.seconds,    DateCase.getSeconds() );
    testcases[item++] = new TestCase( SECTION, DateString+".getMilliseconds()",     LocalDate.ms,         DateCase.getMilliseconds() );

    DateCase.toString = Object.prototype.toString;

    testcases[item++] = new TestCase( SECTION,
                                      DateString+".toString=Object.prototype.toString;"+DateString+".toString()",
                                      "[object Date]",
                                      DateCase.toString() );
}

function MyDate() {
    this.year = 0;
    this.month = 0;
    this.date = 0;
    this.hours = 0;
    this.minutes = 0;
    this.seconds = 0;
    this.ms = 0;
}
function LocalDateFromTime(t) {
    t = LocalTime(t);
    return ( MyDateFromTime(t) );
}
function UTCDateFromTime(t) {
 return ( MyDateFromTime(t) );
}
function MyDateFromTime( t ) {
    var d = new MyDate();
    d.year = YearFromTime(t);
    d.month = MonthFromTime(t);
    d.date = DateFromTime(t);
    d.hours = HourFromTime(t);
    d.minutes = MinFromTime(t);
    d.seconds = SecFromTime(t);
    d.ms = msFromTime(t);

    d.time = MakeTime( d.hours, d.minutes, d.seconds, d.ms );
    d.value = TimeClip( MakeDate( MakeDay( d.year, d.month, d.date ), d.time ) );
    d.day = WeekDay( d.value );

    return (d);
}
function SetFullYear( t, year, mon, date ) {
    var T = ( isNaN(t) ) ? 0 : LocalTime(t) ;
    var YEAR = Number( year );
    var MONTH = ( mon == void 0 ) ? MonthFromTime(T) : Number( mon );
    var DATE = ( date == void 0 ) ? DateFromTime(T)  : Number( date );

    var DAY = MakeDay( YEAR, MONTH, DATE );
    var UTC_DATE = UTC(MakeDate( DAY, TimeWithinDay(T)));

    return ( TimeClip(UTC_DATE) );
}