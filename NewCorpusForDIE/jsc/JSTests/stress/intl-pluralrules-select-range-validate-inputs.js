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
        throw new Error('bad value: ' + actual);
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

if (Intl.PluralRules.prototype.selectRange) {
    let pl = new Intl.PluralRules('en-US');
    shouldThrow(() => {
        pl.selectRange();
    }, `TypeError: start or end is undefined`);
    shouldThrow(() => {
        pl.selectRange(0, undefined);
    }, `TypeError: start or end is undefined`);
    shouldThrow(() => {
        pl.selectRange(undefined, 0);
    }, `TypeError: start or end is undefined`);
    shouldThrow(() => {
        pl.selectRange(undefined, undefined);
    }, `TypeError: start or end is undefined`);
    shouldThrow(() => {
        pl.selectRange(NaN, 0);
    }, `RangeError: Passed numbers are out of range`);
    shouldThrow(() => {
        pl.selectRange(0, NaN);
    }, `RangeError: Passed numbers are out of range`);
    shouldThrow(() => {
        pl.selectRange(NaN, NaN);
    }, `RangeError: Passed numbers are out of range`);
    shouldBe(pl.selectRange(0, -0), `other`);
    shouldBe(pl.selectRange(20, -20), `other`);
}
