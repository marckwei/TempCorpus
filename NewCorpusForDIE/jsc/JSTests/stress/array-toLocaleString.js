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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`expected ${expected} but got ${actual}`);
}

function shouldBeOneOf(actual, expectedArray) {
    if (!expectedArray.some((value) => value === actual))
        throw new Error('bad value: ' + actual + ' expected values: ' + expectedArray);
}

function shouldThrow(func, errorType) {
    let error;
    try {
        func();
    } catch (e) {
        error = e;
    }

    if (!(error instanceof errorType))
        throw new Error(`Expected ${errorType.name}!`);
}

shouldBe(Array.prototype.toLocaleString.length, 0);
shouldBe(Object.getOwnPropertyDescriptor(Array.prototype, 'toLocaleString').enumerable, false);
shouldBe(Object.getOwnPropertyDescriptor(Array.prototype, 'toLocaleString').configurable, true);
shouldBe(Object.getOwnPropertyDescriptor(Array.prototype, 'toLocaleString').writable, true);

// Test toObject abrupt completion.
shouldThrow(() => Array.prototype.toLocaleString.call(), TypeError);
shouldThrow(() => Array.prototype.toLocaleString.call(undefined), TypeError);
shouldThrow(() => Array.prototype.toLocaleString.call(null), TypeError);

// Test Generic invocation.
shouldBe(Array.prototype.toLocaleString.call({ length: 5, 0: 'zero', 1: 1, 3: 'three', 5: 'five' }), 'zero,1,,three,')

// Empty array is always an empty string.
shouldBe([].toLocaleString(), '');

// Missing still get a separator.
shouldBe(Array(5).toLocaleString(), ',,,,');
shouldBe([ null, null ].toLocaleString(), ',');
shouldBe([ undefined, undefined ].toLocaleString(), ',');

// Test that parameters are passed through properly.
shouldThrow(() => [ new Date ].toLocaleString('i'), RangeError);
shouldBeOneOf([ new Date(NaN), new Date(0) ].toLocaleString('zh-Hans-CN-u-nu-hanidec', { timeZone: 'UTC' }), [ 'Invalid Date,一九七〇/一/一 〇〇:〇〇:〇〇', 'Invalid Date,一九七〇/一/一 上午一二:〇〇:〇〇' ]);
