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

//@ requireOptions("--useIntlDurationFormat=1")

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function shouldBeOneOf(actual, expectedArray) {
    if (!expectedArray.some((value) => value === actual))
        throw new Error('bad value: ' + actual + ' expected values: ' + expectedArray);
}

if (Intl.DurationFormat) {
    {
        var fmt = new Intl.DurationFormat('en-DK', {
            style: 'digital'
        });
        shouldBeOneOf(fmt.format({ years: 1, months: 2, weeks: 3, days: 4, hours: 10, minutes: 34, seconds: 33, milliseconds: 32 }), [
            `1y, 2mo, 3w, 4d, 10.34.33`,
            `1y, 2m, 3w, 4d, 10.34.33`,
        ]);
    }
    {
        var fmt = new Intl.DurationFormat('en-DK-u-ca-buddhist', {
            style: 'digital'
        });
        shouldBeOneOf(fmt.format({ years: 1, months: 2, weeks: 3, days: 4, hours: 10, minutes: 34, seconds: 33, milliseconds: 32 }), [
            `1y, 2mo, 3w, 4d, 10.34.33`,
            `1y, 2m, 3w, 4d, 10.34.33`,
        ]);
    }
    {
        var fmt = new Intl.DurationFormat('en-DK-u-nu-hanidec', {
            style: 'digital'
        });
        shouldBeOneOf(fmt.format({ years: 1, months: 2, weeks: 3, days: 4, hours: 10, minutes: 34, seconds: 33, milliseconds: 32 }), [
            `一y, 二mo, 三w, 四d, 一〇:三四:三三`,
            `一y, 二m, 三w, 四d, 一〇:三四:三三`,
        ]);
    }
    {
        var fmt = new Intl.DurationFormat('en', {
            style: 'digital'
        });
        shouldBeOneOf(fmt.format({ years: 1, months: 2, weeks: 3, days: 4, hours: 10, minutes: 34, seconds: 33, milliseconds: 32 }), [
            `1y, 2mo, 3w, 4d, 10:34:33`,
            `1y, 2m, 3w, 4d, 10:34:33`,
        ]);
    }
    {
        var fmt = new Intl.DurationFormat('en', {
            style: 'digital'
        });
        shouldBeOneOf(fmt.format({ years: 1, months: 2, weeks: 3, days: 4, hours: 10, minutes: 34, seconds: 33, milliseconds: 32 }), [
            `1y, 2mo, 3w, 4d, 10:34:33`,
            `1y, 2m, 3w, 4d, 10:34:33`,
        ]);
    }
    {
        var fmt = new Intl.DurationFormat('en', {
            style: 'digital',
            milliseconds: 'numeric',
            millisecondsDisplay: 'always',
            fractionalDigits: 9
        });

        shouldBeOneOf(fmt.format({ years: 1, months: 2, weeks: 3, days: 4, hours: 10, minutes: 34, seconds: 33, milliseconds: 32 }), [
            `1y, 2mo, 3w, 4d, 10:34:33.032000000`,
            `1y, 2m, 3w, 4d, 10:34:33.032000000`,
        ]);
    }
    {
        var fmt = new Intl.DurationFormat('en', {
            style: 'digital',
            milliseconds: 'numeric',
            millisecondsDisplay: 'always',
            fractionalDigits: 2
        });

        shouldBeOneOf(fmt.format({ years: 1, months: 2, weeks: 3, days: 4, hours: 10, minutes: 34, seconds: 33, milliseconds: 32 }), [
            `1y, 2mo, 3w, 4d, 10:34:33.03`,
            `1y, 2m, 3w, 4d, 10:34:33.03`,
        ]);
    }
    {
        var fmt = new Intl.DurationFormat('en', {
            style: 'digital',
            milliseconds: 'numeric',
            fractionalDigits: 9
        });

        shouldBeOneOf(fmt.format({ hours: 10, seconds: 33, milliseconds: 32 }), [
            `10:00:33.032000000`,
        ]);
    }
    {
        var fmt = new Intl.DurationFormat('en', {
            style: 'digital',
            milliseconds: 'numeric',
            fractionalDigits: 9
        });

        shouldBeOneOf(fmt.format({ minutes: 10, seconds: 33, milliseconds: 32 }), [
            `0:10:33.032000000`,
        ]);
    }
    {
        var fmt = new Intl.DurationFormat('en', {
            style: 'digital',
            milliseconds: 'numeric',
            fractionalDigits: 9
        });

        shouldBeOneOf(fmt.format({ hours: 10, minutes: 10, milliseconds: 32, microseconds: 44, nanoseconds: 55 }), [
            `10:10:00.032044055`,
        ]);
    }
    {
        var fmt = new Intl.DurationFormat('en', {
            style: 'digital',
        });

        shouldBeOneOf(fmt.format({ hours: 10, minutes: 10, milliseconds: 32}), [
            `10:10:00`,
        ]);
    }
    {
        var fmt = new Intl.DurationFormat('en', {
            style: 'digital',
        });

        shouldBeOneOf(fmt.format({ hours: 0, minutes: 10}), [
            `0:10:00`,
        ]);
        shouldBeOneOf(fmt.format({ hours: 5, minutes: 6}), [
            `5:06:00`,
        ]);
        shouldBeOneOf(fmt.format({ minutes: 5, seconds:6}), [
            `0:05:06`,
        ]);
    }
}
