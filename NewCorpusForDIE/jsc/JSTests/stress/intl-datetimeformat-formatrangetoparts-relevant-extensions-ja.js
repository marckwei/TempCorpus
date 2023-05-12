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

function normalize(actual) {
    // Tolerate different space characters used by different ICU versions.
    // Older ICU uses U+2009 Thin Space in ranges, whereas newer ICU uses
    // regular old U+0020. Let's ignore these differences.
    if (typeof actual === 'string')
        return actual.replaceAll(' ', ' ');
    return actual;
}

function shouldBe(actual, expected) {
    actual = normalize(actual);
    if (actual !== expected)
        throw new Error('bad value: ' + actual + ' expected value: ' + expected);
}

function shouldBeOneOf(actual, expectedArray) {
    actual = normalize(actual);
    if (!expectedArray.some((value) => value === actual))
        throw new Error('bad value: ' + actual + ' expected values: ' + expectedArray);
}

function compareParts(actual, expected) {
    if (actual.length !== expected.length)
        return false;
    for (var i = 0; i < actual.length; ++i) {
        if (normalize(actual[i].type) !== expected[i].type)
            return false;
        if (normalize(actual[i].value) !== expected[i].value)
            return false;
        if (normalize(actual[i].source) !== expected[i].source)
            return false;
    }
    return true;
}

function shouldBeOneOfParts(actual, expectedArray) {
    for (let expected of expectedArray) {
        if (compareParts(actual, expected))
            return;
    }
    for (let part of actual) {
        print(JSON.stringify(part) + ',');
    }
    throw new Error('bad value: ' + actual + ' expected value: ' + expectedArray);
}

function shouldBeParts(actual, expected) {
    shouldBe(actual.length, expected.length);
    for (var i = 0; i < actual.length; ++i) {
        shouldBe(actual[i].type, expected[i].type);
        shouldBe(actual[i].value, expected[i].value);
        shouldBe(actual[i].source, expected[i].source);
    }
}

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

let date1 = new Date(Date.UTC(2007, 0, 10, 10, 0, 0));
let date2 = new Date(Date.UTC(2007, 0, 10, 11, 0, 0));
let date3 = new Date(Date.UTC(2007, 0, 20, 10, 0, 0));
let date4 = new Date(Date.UTC(2010, 0, 20, 10, 0, 0));

let date5 = new Date(Date.UTC(2007, 0, 10, 12, 0, 0));
let date6 = new Date(Date.UTC(2007, 0, 10, 14, 0, 0));
let date7 = new Date(Date.UTC(2007, 0, 10, 23, 0, 0));
let date8 = new Date(Date.UTC(2007, 0, 11, 0, 0, 0));

if (Intl.DateTimeFormat.prototype.formatRangeToParts) {
    // Test three relavant extensions.
    // "nu" NumberingSystem
    let fmt1 = new Intl.DateTimeFormat("ja", {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'America/Los_Angeles',
        numberingSystem: 'hanidec',
    });
    shouldBe(fmt1.format(date1), `〇七/一/一〇 二:〇〇`);
    shouldBeParts(fmt1.formatRangeToParts(date1, date2), [
        {"type":"year","value":"〇七","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"一","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"一〇","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"hour","value":"二","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"〇〇","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"hour","value":"三","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"〇〇","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt1.formatRangeToParts(date1, date3), [
        {"type":"year","value":"〇七","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"一","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"一〇","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"hour","value":"二","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"〇〇","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"〇七","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"一","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"二〇","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"hour","value":"二","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"〇〇","source":"endRange"},
    ]);

    // "ca" Calendar
    let fmt2 = new Intl.DateTimeFormat("ja", {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'America/Los_Angeles',
        calendar: 'chinese'
    });
    shouldBeOneOf(fmt2.format(date1), [ `丙戌-11-22 2:00`, `丙戌年11月22日 2:00` ]);
    shouldBeParts(fmt2.formatRangeToParts(date1, date2), [
        {"type":"yearName","value":"丙戌","source":"shared"},
        {"type":"literal","value":"年","source":"shared"},
        {"type":"month","value":"11","source":"shared"},
        {"type":"literal","value":"月","source":"shared"},
        {"type":"day","value":"22","source":"shared"},
        {"type":"literal","value":"日 ","source":"shared"},
        {"type":"hour","value":"2","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"hour","value":"3","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt2.formatRangeToParts(date1, date3), [
        {"type":"yearName","value":"丙戌","source":"startRange"},
        {"type":"literal","value":"年","source":"startRange"},
        {"type":"month","value":"11","source":"startRange"},
        {"type":"literal","value":"月","source":"startRange"},
        {"type":"day","value":"22","source":"startRange"},
        {"type":"literal","value":"日 ","source":"startRange"},
        {"type":"hour","value":"2","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"yearName","value":"丙戌","source":"endRange"},
        {"type":"literal","value":"年","source":"endRange"},
        {"type":"month","value":"12","source":"endRange"},
        {"type":"literal","value":"月","source":"endRange"},
        {"type":"day","value":"2","source":"endRange"},
        {"type":"literal","value":"日 ","source":"endRange"},
        {"type":"hour","value":"2","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);

    let fmt3 = new Intl.DateTimeFormat("ja", {
        year: 'numeric',
        timeZone: 'America/Los_Angeles',
        calendar: 'chinese'
    });
    shouldBe(fmt3.format(date1), `丙戌年`);
    shouldBeParts(fmt3.formatRangeToParts(date1, date2), [
        {"type":"yearName","value":"丙戌","source":"shared"},
        {"type":"literal","value":"年","source":"shared"},
    ]);
    shouldBeParts(fmt3.formatRangeToParts(date1, date3), [
        {"type":"yearName","value":"丙戌","source":"shared"},
        {"type":"literal","value":"年","source":"shared"},
    ]);
    shouldBeParts(fmt3.formatRangeToParts(date1, date4), [
        {"type":"yearName","value":"丙戌","source":"startRange"},
        {"type":"literal","value":"年～","source":"shared"},
        {"type":"yearName","value":"己丑","source":"endRange"},
        {"type":"literal","value":"年","source":"shared"},
    ]);

    // Calendar-sensitive format
    let fmt4 = new Intl.DateTimeFormat('ja-u-ca-buddhist', {
        year: 'numeric',
        timeZone: 'America/Los_Angeles',
    });
    shouldBe(fmt4.format(date1), `仏暦2550年`);
    shouldBeParts(fmt4.formatRangeToParts(date1, date2), [
        {"type":"era","value":"仏暦","source":"shared"},
        {"type":"year","value":"2550","source":"shared"},
        {"type":"literal","value":"年","source":"shared"},
    ]);
    shouldBeParts(fmt4.formatRangeToParts(date1, date3), [
        {"type":"era","value":"仏暦","source":"shared"},
        {"type":"year","value":"2550","source":"shared"},
        {"type":"literal","value":"年","source":"shared"},
    ]);
    shouldBeParts(fmt4.formatRangeToParts(date1, date4), [
        {"type":"era","value":"仏暦","source":"shared"},
        {"type":"year","value":"2550","source":"startRange"},
        {"type":"literal","value":"年～","source":"shared"},
        {"type":"year","value":"2553","source":"endRange"},
        {"type":"literal","value":"年","source":"shared"},
    ]);

    // "hc" HourCycle
    let fmt5 = new Intl.DateTimeFormat("ja", {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'UTC',
        hourCycle: 'h24',
    });
    shouldBe(fmt5.format(date1), `07/1/10 10:00`);
    shouldBe(fmt5.format(date8), `07/1/11 24:00`);
    shouldBeOneOfParts(fmt5.formatRangeToParts(date1, date2), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ],
    ]);
    shouldBeParts(fmt5.formatRangeToParts(date1, date3), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"20","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"hour","value":"10","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);
    shouldBeOneOfParts(fmt5.formatRangeToParts(date1, date5), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"hour","value":"12","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"hour","value":"12","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ],
    ]);
    shouldBeOneOfParts(fmt5.formatRangeToParts(date1, date6), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"hour","value":"14","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"hour","value":"14","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ],
    ]);
    shouldBeOneOfParts(fmt5.formatRangeToParts(date1, date7), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"hour","value":"23","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"hour","value":"23","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ],
    ]);
    if ($vm.icuVersion() > 66) {
        shouldBeParts(fmt5.formatRangeToParts(date1, date8), [
            {"type":"year","value":"07","source":"startRange"},
            {"type":"literal","value":"/","source":"startRange"},
            {"type":"month","value":"1","source":"startRange"},
            {"type":"literal","value":"/","source":"startRange"},
            {"type":"day","value":"10","source":"startRange"},
            {"type":"literal","value":" ","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"year","value":"07","source":"endRange"},
            {"type":"literal","value":"/","source":"endRange"},
            {"type":"month","value":"1","source":"endRange"},
            {"type":"literal","value":"/","source":"endRange"},
            {"type":"day","value":"11","source":"endRange"},
            {"type":"literal","value":" ","source":"endRange"},
            {"type":"hour","value":"24","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ]);
    }

    let fmt6 = new Intl.DateTimeFormat("ja", {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'UTC',
        hourCycle: 'h23',
    });
    shouldBe(fmt6.format(date1), `07/1/10 10:00`);
    shouldBe(fmt6.format(date8), `07/1/11 0:00`);
    shouldBeParts(fmt6.formatRangeToParts(date1, date2), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"hour","value":"11","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt6.formatRangeToParts(date1, date3), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"20","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"hour","value":"10","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);
    shouldBeParts(fmt6.formatRangeToParts(date1, date5), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"hour","value":"12","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt6.formatRangeToParts(date1, date6), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"hour","value":"14","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt6.formatRangeToParts(date1, date7), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"hour","value":"23","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt6.formatRangeToParts(date1, date8), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"11","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"hour","value":"0","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);

    let fmt7 = new Intl.DateTimeFormat("ja", {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'UTC',
        hourCycle: 'h11',
    });
    shouldBe(fmt7.format(date1), `07/1/10 午前10:00`);
    shouldBe(fmt7.format(date8), `07/1/11 午前0:00`);
    shouldBeOneOfParts(fmt7.formatRangeToParts(date1, date2), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ],
    ]);
    shouldBeParts(fmt7.formatRangeToParts(date1, date3), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"20","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"dayPeriod","value":"午前","source":"endRange"},
        {"type":"hour","value":"10","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);
    shouldBeOneOfParts(fmt7.formatRangeToParts(date1, date5), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"0","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"0","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeOneOfParts(fmt7.formatRangeToParts(date1, date6), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"2","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"2","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeOneOfParts(fmt7.formatRangeToParts(date1, date7), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeParts(fmt7.formatRangeToParts(date1, date8), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"11","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"dayPeriod","value":"午前","source":"endRange"},
        {"type":"hour","value":"0","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);

    let fmt8 = new Intl.DateTimeFormat("ja", {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'UTC',
        hourCycle: 'h12',
    });
    shouldBe(fmt8.format(date1), `07/1/10 午前10:00`);
    shouldBe(fmt8.format(date8), `07/1/11 午前12:00`);
    shouldBeParts(fmt8.formatRangeToParts(date1, date2), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"dayPeriod","value":"午前","source":"shared"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"hour","value":"11","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt8.formatRangeToParts(date1, date3), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"20","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"dayPeriod","value":"午前","source":"endRange"},
        {"type":"hour","value":"10","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);
    shouldBeParts(fmt8.formatRangeToParts(date1, date5), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"dayPeriod","value":"午後","source":"endRange"},
        {"type":"hour","value":"0","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt8.formatRangeToParts(date1, date6), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"dayPeriod","value":"午後","source":"endRange"},
        {"type":"hour","value":"2","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt8.formatRangeToParts(date1, date7), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"dayPeriod","value":"午後","source":"endRange"},
        {"type":"hour","value":"11","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    if ($vm.icuVersion() > 66) {
        shouldBeParts(fmt8.formatRangeToParts(date1, date8), [
            {"type":"year","value":"07","source":"startRange"},
            {"type":"literal","value":"/","source":"startRange"},
            {"type":"month","value":"1","source":"startRange"},
            {"type":"literal","value":"/","source":"startRange"},
            {"type":"day","value":"10","source":"startRange"},
            {"type":"literal","value":" ","source":"startRange"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"year","value":"07","source":"endRange"},
            {"type":"literal","value":"/","source":"endRange"},
            {"type":"month","value":"1","source":"endRange"},
            {"type":"literal","value":"/","source":"endRange"},
            {"type":"day","value":"11","source":"endRange"},
            {"type":"literal","value":" ","source":"endRange"},
            {"type":"dayPeriod","value":"午前","source":"endRange"},
            {"type":"hour","value":"12","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ]);
    }

    // "hc" + hour 2-digit
    let fmt9 = new Intl.DateTimeFormat("ja", {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: 'numeric',
        timeZone: 'UTC',
        hourCycle: 'h24',
    });
    shouldBe(fmt9.format(date1), `07/1/10 10:00`);
    shouldBe(fmt9.format(date8), `07/1/11 24:00`);
    shouldBeOneOfParts(fmt9.formatRangeToParts(date1, date2), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ],
    ]);
    shouldBeParts(fmt9.formatRangeToParts(date1, date3), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"20","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"hour","value":"10","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);
    shouldBeOneOfParts(fmt9.formatRangeToParts(date1, date5), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"hour","value":"12","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"hour","value":"12","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeOneOfParts(fmt9.formatRangeToParts(date1, date6), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"hour","value":"14","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"hour","value":"14","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ],
    ]);
    shouldBeOneOfParts(fmt9.formatRangeToParts(date1, date7), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"hour","value":"23","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"hour","value":"23","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    if ($vm.icuVersion() > 66) {
        shouldBeParts(fmt9.formatRangeToParts(date1, date8), [
            {"type":"year","value":"07","source":"startRange"},
            {"type":"literal","value":"/","source":"startRange"},
            {"type":"month","value":"1","source":"startRange"},
            {"type":"literal","value":"/","source":"startRange"},
            {"type":"day","value":"10","source":"startRange"},
            {"type":"literal","value":" ","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"year","value":"07","source":"endRange"},
            {"type":"literal","value":"/","source":"endRange"},
            {"type":"month","value":"1","source":"endRange"},
            {"type":"literal","value":"/","source":"endRange"},
            {"type":"day","value":"11","source":"endRange"},
            {"type":"literal","value":" ","source":"endRange"},
            {"type":"hour","value":"24","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ]);
    }

    let fmt10 = new Intl.DateTimeFormat("ja", {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: 'numeric',
        timeZone: 'UTC',
        hourCycle: 'h23',
    });
    shouldBe(fmt10.format(date1), `07/1/10 10:00`);
    shouldBe(fmt10.format(date8), `07/1/11 00:00`);
    shouldBeParts(fmt10.formatRangeToParts(date1, date2), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"hour","value":"11","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt10.formatRangeToParts(date1, date3), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"20","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"hour","value":"10","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);
    shouldBeParts(fmt10.formatRangeToParts(date1, date5), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"hour","value":"12","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt10.formatRangeToParts(date1, date6), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"hour","value":"14","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt10.formatRangeToParts(date1, date7), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"hour","value":"23","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt10.formatRangeToParts(date1, date8), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"11","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"hour","value":"0","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);

    let fmt11 = new Intl.DateTimeFormat("ja", {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: 'numeric',
        timeZone: 'UTC',
        hourCycle: 'h11',
    });
    shouldBe(fmt11.format(date1), `07/1/10 午前10:00`);
    shouldBe(fmt11.format(date8), `07/1/11 午前00:00`);
    shouldBeOneOfParts(fmt11.formatRangeToParts(date1, date2), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeParts(fmt11.formatRangeToParts(date1, date3), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"20","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"dayPeriod","value":"午前","source":"endRange"},
        {"type":"hour","value":"10","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);
    shouldBeOneOfParts(fmt11.formatRangeToParts(date1, date5), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"0","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"0","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeOneOfParts(fmt11.formatRangeToParts(date1, date6), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"2","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"2","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeOneOfParts(fmt11.formatRangeToParts(date1, date7), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeParts(fmt11.formatRangeToParts(date1, date8), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"11","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"dayPeriod","value":"午前","source":"endRange"},
        {"type":"hour","value":"0","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);

    let fmt12 = new Intl.DateTimeFormat("ja", {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: 'numeric',
        timeZone: 'UTC',
        hourCycle: 'h12',
    });
    shouldBe(fmt12.format(date1), `07/1/10 午前10:00`);
    shouldBe(fmt12.format(date8), `07/1/11 午前12:00`);
    shouldBeParts(fmt12.formatRangeToParts(date1, date2), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"dayPeriod","value":"午前","source":"shared"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"hour","value":"11","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt12.formatRangeToParts(date1, date3), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"20","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"dayPeriod","value":"午前","source":"endRange"},
        {"type":"hour","value":"10","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);
    shouldBeParts(fmt12.formatRangeToParts(date1, date5), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"dayPeriod","value":"午後","source":"endRange"},
        {"type":"hour","value":"0","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt12.formatRangeToParts(date1, date6), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"dayPeriod","value":"午後","source":"endRange"},
        {"type":"hour","value":"2","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    shouldBeParts(fmt12.formatRangeToParts(date1, date7), [
        {"type":"year","value":"07","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"month","value":"1","source":"shared"},
        {"type":"literal","value":"/","source":"shared"},
        {"type":"day","value":"10","source":"shared"},
        {"type":"literal","value":" ","source":"shared"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":"時","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"分～","source":"shared"},
        {"type":"dayPeriod","value":"午後","source":"endRange"},
        {"type":"hour","value":"11","source":"endRange"},
        {"type":"literal","value":"時","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
        {"type":"literal","value":"分","source":"shared"},
    ]);
    if ($vm.icuVersion() > 66) {
        shouldBeParts(fmt12.formatRangeToParts(date1, date8), [
            {"type":"year","value":"07","source":"startRange"},
            {"type":"literal","value":"/","source":"startRange"},
            {"type":"month","value":"1","source":"startRange"},
            {"type":"literal","value":"/","source":"startRange"},
            {"type":"day","value":"10","source":"startRange"},
            {"type":"literal","value":" ","source":"startRange"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"year","value":"07","source":"endRange"},
            {"type":"literal","value":"/","source":"endRange"},
            {"type":"month","value":"1","source":"endRange"},
            {"type":"literal","value":"/","source":"endRange"},
            {"type":"day","value":"11","source":"endRange"},
            {"type":"literal","value":" ","source":"endRange"},
            {"type":"dayPeriod","value":"午前","source":"endRange"},
            {"type":"hour","value":"12","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ]);
    }

    // "hc" + hour12.
    let fmt13 = new Intl.DateTimeFormat("ja", {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: 'numeric',
        timeZone: 'UTC',
        hourCycle: 'h24',
        hour12: true,
    });
    shouldBe(fmt13.format(date1), `07/1/10 午前10:00`);
    shouldBe(fmt13.format(date8), `07/1/11 午前00:00`);
    shouldBeOneOfParts(fmt13.formatRangeToParts(date1, date2), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeParts(fmt13.formatRangeToParts(date1, date3), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"20","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"dayPeriod","value":"午前","source":"endRange"},
        {"type":"hour","value":"10","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);
    shouldBeOneOfParts(fmt13.formatRangeToParts(date1, date5), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"0","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"0","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeOneOfParts(fmt13.formatRangeToParts(date1, date6), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"2","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"2","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeOneOfParts(fmt13.formatRangeToParts(date1, date7), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeParts(fmt13.formatRangeToParts(date1, date8), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"11","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"dayPeriod","value":"午前","source":"endRange"},
        {"type":"hour","value":"0","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);

    let fmt14 = new Intl.DateTimeFormat("ja", {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: 'numeric',
        timeZone: 'UTC',
        hourCycle: 'h23',
        hour12: true,
    });
    shouldBe(fmt14.format(date1), `07/1/10 午前10:00`);
    shouldBe(fmt14.format(date8), `07/1/11 午前00:00`);
    shouldBeOneOfParts(fmt14.formatRangeToParts(date1, date2), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeParts(fmt14.formatRangeToParts(date1, date3), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"20","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"dayPeriod","value":"午前","source":"endRange"},
        {"type":"hour","value":"10","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);
    shouldBeOneOfParts(fmt14.formatRangeToParts(date1, date5), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"0","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"0","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeOneOfParts(fmt14.formatRangeToParts(date1, date6), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"2","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"2","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeOneOfParts(fmt14.formatRangeToParts(date1, date7), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeParts(fmt14.formatRangeToParts(date1, date8), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"11","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"dayPeriod","value":"午前","source":"endRange"},
        {"type":"hour","value":"0","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);

    let fmt15 = new Intl.DateTimeFormat("ja", {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: 'numeric',
        timeZone: 'UTC',
        hourCycle: 'h11',
        hour12: true,
    });
    shouldBe(fmt15.format(date1), `07/1/10 午前10:00`);
    shouldBe(fmt15.format(date8), `07/1/11 午前00:00`);
    shouldBeOneOfParts(fmt15.formatRangeToParts(date1, date2), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeParts(fmt15.formatRangeToParts(date1, date3), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"20","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"dayPeriod","value":"午前","source":"endRange"},
        {"type":"hour","value":"10","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);
    shouldBeOneOfParts(fmt15.formatRangeToParts(date1, date5), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"0","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"0","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeOneOfParts(fmt15.formatRangeToParts(date1, date6), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"2","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"2","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeOneOfParts(fmt15.formatRangeToParts(date1, date7), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeParts(fmt15.formatRangeToParts(date1, date8), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"11","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"dayPeriod","value":"午前","source":"endRange"},
        {"type":"hour","value":"0","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);

    let fmt16 = new Intl.DateTimeFormat("ja", {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: 'numeric',
        timeZone: 'UTC',
        hourCycle: 'h12',
        hour12: true,
    });
    shouldBe(fmt16.format(date1), `07/1/10 午前10:00`);
    shouldBe(fmt16.format(date8), `07/1/11 午前00:00`);
    shouldBeOneOfParts(fmt16.formatRangeToParts(date1, date2), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"shared"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeParts(fmt16.formatRangeToParts(date1, date3), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"20","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"dayPeriod","value":"午前","source":"endRange"},
        {"type":"hour","value":"10","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);
    shouldBeOneOfParts(fmt16.formatRangeToParts(date1, date5), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"0","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"0","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeOneOfParts(fmt16.formatRangeToParts(date1, date6), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"2","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"2","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeOneOfParts(fmt16.formatRangeToParts(date1, date7), [
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":":","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":":","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
        ],
        [
            {"type":"year","value":"07","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"month","value":"1","source":"shared"},
            {"type":"literal","value":"/","source":"shared"},
            {"type":"day","value":"10","source":"shared"},
            {"type":"literal","value":" ","source":"shared"},
            {"type":"dayPeriod","value":"午前","source":"startRange"},
            {"type":"hour","value":"10","source":"startRange"},
            {"type":"literal","value":"時","source":"startRange"},
            {"type":"minute","value":"00","source":"startRange"},
            {"type":"literal","value":"分～","source":"shared"},
            {"type":"dayPeriod","value":"午後","source":"endRange"},
            {"type":"hour","value":"11","source":"endRange"},
            {"type":"literal","value":"時","source":"endRange"},
            {"type":"minute","value":"00","source":"endRange"},
            {"type":"literal","value":"分","source":"shared"},
        ]
    ]);
    shouldBeParts(fmt16.formatRangeToParts(date1, date8), [
        {"type":"year","value":"07","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"month","value":"1","source":"startRange"},
        {"type":"literal","value":"/","source":"startRange"},
        {"type":"day","value":"10","source":"startRange"},
        {"type":"literal","value":" ","source":"startRange"},
        {"type":"dayPeriod","value":"午前","source":"startRange"},
        {"type":"hour","value":"10","source":"startRange"},
        {"type":"literal","value":":","source":"startRange"},
        {"type":"minute","value":"00","source":"startRange"},
        {"type":"literal","value":"～","source":"shared"},
        {"type":"year","value":"07","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"month","value":"1","source":"endRange"},
        {"type":"literal","value":"/","source":"endRange"},
        {"type":"day","value":"11","source":"endRange"},
        {"type":"literal","value":" ","source":"endRange"},
        {"type":"dayPeriod","value":"午前","source":"endRange"},
        {"type":"hour","value":"0","source":"endRange"},
        {"type":"literal","value":":","source":"endRange"},
        {"type":"minute","value":"00","source":"endRange"},
    ]);
}
