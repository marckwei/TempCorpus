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
    File Name:          15.9.5.31-1.js
    ECMA Section:       15.9.5.31 Date.prototype.setUTCHours(hour [, min [, sec [, ms ]]] )
    Description:
    If min is not specified, this behaves as if min were specified with the value getUTCMinutes( ).
    If sec is not specified, this behaves as if sec were specified with the value getUTCSeconds ( ).
    If ms is not specified, this behaves as if ms were specified with the value getUTCMilliseconds( ).

   1.Let t be this time value.
   2.Call ToNumber(hour).
   3.If min is not specified, compute MinFromTime(t); otherwise, call ToNumber(min).
   4.If sec is not specified, compute SecFromTime(t); otherwise, call ToNumber(sec).
   5.If ms is not specified, compute msFromTime(t); otherwise, call ToNumber(ms).
   6.Compute MakeTime(Result(2), Result(3), Result(4), Result(5)).
   7.Compute MakeDate(Day(t), Result(6)).
   8.Set the [[Value]] property of the this value to TimeClip(Result(7)).

   1.Return the value of the [[Value]] property of the this value.
    Author:             christine@netscape.com
    Date:               12 november 1997
*/
    var SECTION = "15.9.5.31-1";
    var VERSION = "ECMA_1";
    startTest();

    writeHeaderToLog( SECTION + " Date.prototype.setUTCHours(hour [, min [, sec [, ms ]]] )");

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
    addNewTestCase( 0, 0, void 0, void 0, void 0,
                    "TDATE = new Date(0);(TDATE).setUTCHours(0);TDATE",
                    UTCDateFromTime(SetUTCHours(0,0,0,0)),
                    LocalDateFromTime(SetUTCHours(0,0,0,0)) );

    addNewTestCase( 28800000, 23, 59, 999, void 0,
                    "TDATE = new Date(28800000);(TDATE).setUTCHours(23,59,999);TDATE",
                    UTCDateFromTime(SetUTCHours(28800000,23,59,999)),
                    LocalDateFromTime(SetUTCHours(28800000,23,59,999)) );

    addNewTestCase( 28800000,999,999, void 0, void 0,
                    "TDATE = new Date(28800000);(TDATE).setUTCHours(999,999);TDATE",
                    UTCDateFromTime(SetUTCHours(28800000,999,999)),
                    LocalDateFromTime(SetUTCHours(28800000,999,999)) );

    addNewTestCase( 28800000, 999, void 0, void 0, void 0,
                    "TDATE = new Date(28800000);(TDATE).setUTCHours(999);TDATE",
                    UTCDateFromTime(SetUTCHours(28800000,999,0)),
                    LocalDateFromTime(SetUTCHours(28800000,999,0)) );

    addNewTestCase( 28800000, -8670, void 0, void 0, void 0,
                    "TDATE = new Date(28800000);(TDATE).setUTCHours(-8670);TDATE",
                    UTCDateFromTime(SetUTCHours(28800000,-8670)),
                    LocalDateFromTime(SetUTCHours(28800000,-8670)) );

    addNewTestCase( 946684800000, 1234567, void 0, void 0, void 0,
                    "TDATE = new Date(946684800000);(TDATE).setUTCHours(1234567);TDATE",
                    UTCDateFromTime(SetUTCHours(946684800000,1234567)),
                    LocalDateFromTime(SetUTCHours(946684800000,1234567)) );

    addNewTestCase( -2208988800000, 59, 999, void 0, void 0,
                    "TDATE = new Date(-2208988800000);(TDATE).setUTCHours(59,999);TDATE",
                    UTCDateFromTime(SetUTCHours(-2208988800000,59,999)),
                    LocalDateFromTime(SetUTCHours(-2208988800000,59,999)) );
/*
    addNewTestCase( "TDATE = new Date(-2208988800000);(TDATE).setUTCMilliseconds(123456789);TDATE",
                    UTCDateFromTime(SetUTCMilliseconds(-2208988800000,123456789)),
                    LocalDateFromTime(SetUTCMilliseconds(-2208988800000,123456789)) );

    addNewTestCase( "TDATE = new Date(-2208988800000);(TDATE).setUTCMilliseconds(123456);TDATE",
                    UTCDateFromTime(SetUTCMilliseconds(-2208988800000,123456)),
                    LocalDateFromTime(SetUTCMilliseconds(-2208988800000,123456)) );

    addNewTestCase( "TDATE = new Date(-2208988800000);(TDATE).setUTCMilliseconds(-123456);TDATE",
                    UTCDateFromTime(SetUTCMilliseconds(-2208988800000,-123456)),
                    LocalDateFromTime(SetUTCMilliseconds(-2208988800000,-123456)) );

    addNewTestCase( "TDATE = new Date(0);(TDATE).setUTCMilliseconds(-999);TDATE",
                    UTCDateFromTime(SetUTCMilliseconds(0,-999)),
                    LocalDateFromTime(SetUTCMilliseconds(0,-999)) );
*/

}
function addNewTestCase( time, hours, min, sec, ms, DateString, UTCDate, LocalDate) {

    DateCase = new Date(time);
    if ( min == void 0 ) {
        DateCase.setUTCHours( hours );
    } else {
        if ( sec == void 0 ) {
            DateCase.setUTCHours( hours, min );
        } else {
            if ( ms == void 0 ) {
                DateCase.setUTCHours( hours, min, sec );
            } else {
                DateCase.setUTCHours( hours, min, sec, ms );
            }
        }
    }

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
function SetUTCHours( t, hour, min, sec, ms ) {
    var TIME = t;
    var HOUR = Number(hour);
    var MIN =  ( min == void 0) ? MinFromTime(TIME) : Number(min);
    var SEC  = ( sec == void 0) ? SecFromTime(TIME) : Number(sec);
    var MS   = ( ms == void 0 ) ? msFromTime(TIME)  : Number(ms);
    var RESULT6 = MakeTime( HOUR,
                            MIN,
                            SEC,
                            MS );
    return ( TimeClip(MakeDate(Day(TIME), RESULT6)) );
}
