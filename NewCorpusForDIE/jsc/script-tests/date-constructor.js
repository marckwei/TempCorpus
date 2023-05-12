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

//@ skip if $hostOS == "windows"

description(
'This test case tests the Date constructor. ' +
'In particular, it tests many cases of creating a Date from another Date ' +
'and creating a Date from an object that has both valueOf and toString functions.'
);

var object = new Object;
object.valueOf = function() { return 1995; }
object.toString = function() { return "2222"; }

shouldBe('isNaN(new Date(""))', 'true');

var timeZoneOffset = Date.parse("Dec 25 1995") - Date.parse("Dec 25 1995 GMT");

shouldBe('new Date(1995).getTime()', '1995');
shouldBe('new Date(object).getTime()', '1995');
shouldBe('new Date(new Date(1995)).getTime()', '1995');
shouldBe('new Date(new Date(1995).toString()).getTime()', '1000');

shouldBe('new Date(1995, 1).getTime() - timeZoneOffset', '791596800000');
shouldBe('new Date(1995, 1, 1).getTime() - timeZoneOffset', '791596800000');
shouldBe('new Date(1995, 1, 1, 1).getTime() - timeZoneOffset', '791600400000');
shouldBe('new Date(1995, 1, 1, 1, 1).getTime() - timeZoneOffset', '791600460000');
shouldBe('new Date(1995, 1, 1, 1, 1, 1).getTime() - timeZoneOffset', '791600461000');
shouldBe('new Date(1995, 1, 1, 1, 1, 1, 1).getTime() - timeZoneOffset', '791600461001');
shouldBe('new Date(1995, 1, 1, 1, 1, 1, 1, 1).getTime() - timeZoneOffset', '791600461001');
shouldBe('new Date(1995, 1, 1, 1, 1, 1, 1, 1, 1).getTime() - timeZoneOffset', '791600461001');
shouldBe('new Date(1995, 1, 1, 1, 1, 1, 1, 1, 1).getTime() - timeZoneOffset', '791600461001');

shouldBe('new Date(new Date(1995, 1)).getTime() - timeZoneOffset', '791596800000');
shouldBe('new Date(new Date(1995, 1, 1)).getTime() - timeZoneOffset', '791596800000');
shouldBe('new Date(new Date(1995, 1, 1, 1)).getTime() - timeZoneOffset', '791600400000');
shouldBe('new Date(new Date(1995, 1, 1, 1, 1, 1)).getTime() - timeZoneOffset', '791600461000');
shouldBe('new Date(new Date(1995, 1, 1, 1, 1, 1, 1)).getTime() - timeZoneOffset', '791600461001');
shouldBe('new Date(new Date(1995, 1, 1, 1, 1, 1, 1, 1)).getTime() - timeZoneOffset', '791600461001');
shouldBe('new Date(new Date(1995, 1, 1, 1, 1, 1, 1, 1, 1)).getTime() - timeZoneOffset', '791600461001');

shouldBe("Number(new Date(new Date(Infinity, 1, 1, 1, 1, 1, 1, 1, 1)).getTime() - timeZoneOffset)", 'Number.NaN');
shouldBe("Number(new Date(new Date(1, Infinity, 1, 1, 1, 1, 1, 1, 1)).getTime() - timeZoneOffset)", 'Number.NaN');
shouldBe("Number(new Date(new Date(1, 1, Infinity, 1, 1, 1, 1, 1, 1)).getTime() - timeZoneOffset)", 'Number.NaN');
shouldBe("Number(new Date(new Date(1, 1, 1, Infinity, 1, 1, 1, 1, 1)).getTime() - timeZoneOffset)", 'Number.NaN');
shouldBe("Number(new Date(new Date(1, 1, 1, 1, Infinity, 1, 1, 1, 1)).getTime() - timeZoneOffset)", 'Number.NaN');
shouldBe("Number(new Date(new Date(1, 1, 1, 1, 1, Infinity, 1, 1, 1)).getTime() - timeZoneOffset)", 'Number.NaN');
shouldBe("Number(new Date(new Date(1, 1, 1, 1, 1, 1, Infinity, 1, 1)).getTime() - timeZoneOffset)", 'Number.NaN');
shouldBe("Number(new Date(new Date(1, 1, 1, 1, 1, 1, 1, 1, Infinity)).getTime() - timeZoneOffset)", '-2174770738999');

shouldBe('new Date(6501480442020679337816440, 81696082856817131586190070, 1, 1, 1, 1, 1).getTime()', 'Number.NaN');

shouldBe("new Date(Date.parse('28 Feb 1000 GMT')).toGMTString()", "\"Fri, 28 Feb 1000 00:00:00 GMT\"");
shouldBe("new Date(Date.parse('1 Dec 988 GMT')).toGMTString()", "\"Mon, 01 Dec 0988 00:00:00 GMT\"");
shouldBe("new Date(Date.parse('1 Mar 1000 GMT')).toGMTString()", "\"Sat, 01 Mar 1000 00:00:00 GMT\"");

// In Firefox, the results of the following tests are timezone-dependent, which likely implies that the implementation is not quite correct.
// Our results are even worse, though, as the dates are clipped: (new Date(1995, 1201).getTime()) == (new Date(1995, 601).getTime())
// shouldBe('new Date(1995, 1995, 1995, 1995, 1995, 1995, 1995, 1995).getTime() - timeZoneOffset', '-24085894227889');
// shouldBe('new Date(new Date(1995, 1995, 1995, 1995, 1995, 1995, 1995, 1995)).getTime() - timeZoneOffset', '-24085894227889');

// Regression test for Bug 26978 (https://bugs.webkit.org/show_bug.cgi?id=26978)
var testStr = "";
var year = { valueOf: function() { testStr += 1; return 2007; } };
var month = { valueOf: function() { testStr += 2; return 2; } };
var date = { valueOf: function() { testStr += 3; return 4; } };
var hours = { valueOf: function() { testStr += 4; return 13; } };
var minutes = { valueOf: function() { testStr += 5; return 50; } };
var seconds = { valueOf: function() { testStr += 6; return 0; } };
var ms = { valueOf: function() { testStr += 7; return 999; } };

testStr = "";
new Date(year, month, date, hours, minutes, seconds, ms);
shouldBe('testStr', '\"1234567\"');

testStr = "";
Date.UTC(year, month, date, hours, minutes, seconds, ms);
shouldBe('testStr', '\"1234567\"');

// Regression test for Bug 130123 (https://bugs.webkit.org/show_bug.cgi?id=130123)
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function testDate(year, month, date) {
    var success = true;
    var dateString = monthNames[month] + " " + date + ", " + year;
    var dateObj = new Date(dateString);

    if (dateObj.getFullYear() != year) {
        shouldBe("new Date(" + dateString + ").getFullYear()", year);
        success = false;
    } if (dateObj.getMonth() != month) {
        shouldBe("new Date(" + dateString + ").getMonth()", month);
        success = false;
    } if (dateObj.getDate() != date) {
        shouldBe("new Date(" + dateString + ").getDate()", date);
        success = false;
    }
    return success;
}

var leapTestResult = true;
var year = 100;
var month = 0;
var date = 1;

while (year < 10000) {
    leapTestResult = leapTestResult && testDate(year, month, date);
    year += 1;
    month = (month + 7) % 12;
    date = (date + 13) % 28 + 1;
}

shouldBeTrue("leapTestResult");
