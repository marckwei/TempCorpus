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

"use strict"

function unreachableCodeTest() {
    var a;

    var b = null;
    if (b) {
        a = 5;
    }
    return a == b;
}
noInline(unreachableCodeTest);

for (let i = 0; i < 1e4; ++i) {
    if (!unreachableCodeTest())
        throw "Failed unreachableCodeTest() with i = " + i;
}


function inlinedCompareToNull(a) {
    return a == null;
}

function inlinedComparedToUndefined(a) {
    return a == undefined;
}

// Warmup. Litter the profile with every types.
function warmupInlineFunctions() {
    let returnValue = 0;
    for (let i = 0; i < 1e4; ++i) {
        returnValue += inlinedCompareToNull("foo");
        returnValue += inlinedCompareToNull(null);
        returnValue += inlinedCompareToNull(Math);
        returnValue += inlinedCompareToNull(5);
        returnValue += inlinedCompareToNull(5.5);

        returnValue += inlinedComparedToUndefined("foo");
        returnValue += inlinedComparedToUndefined(null);
        returnValue += inlinedComparedToUndefined(Math);
        returnValue += inlinedComparedToUndefined(5);
        returnValue += inlinedComparedToUndefined(5.5);
    }
    return returnValue;
}
noInline(warmupInlineFunctions);
warmupInlineFunctions();

function testInlineFunctions(undefinedArg, nullArg) {
    if (inlinedCompareToNull("foo"))
        throw "Failed inlinedCompareToNull(\"foo\")";

    if (!inlinedCompareToNull(null))
        throw "Failed !inlinedCompareToNull(null)";

    if (!inlinedCompareToNull(undefined))
        throw "Failed !inlinedCompareToNull(undefined)";

    if (!inlinedCompareToNull(undefinedArg))
        throw "Failed !inlinedCompareToNull(undefinedArg)";

    if (!inlinedCompareToNull(nullArg))
        throw "Failed !inlinedCompareToNull(nullArg)";

}
noInline(testInlineFunctions);

for (let i = 0; i < 1e4; ++i) {
    testInlineFunctions(undefined, null);
}