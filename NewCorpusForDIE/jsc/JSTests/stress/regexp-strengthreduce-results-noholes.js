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

// This teset passes if it doesn't throw.

function runRegExp()
{
    let m = /ab(c)?d/.exec("abd");
    return m;
}

noInline(runRegExp);

let firstResult = undefined;
let firstResultKeys = undefined;

function assertSameAsFirstResult(testRun, o)
{
    if (firstResult.length != o.length)
        throw testRun + " results have different length than the first results";

    oKeys = Object.keys(o);

    if (firstResultKeys.length != oKeys.length)
        throw testRun + " results have different number of keys than the first result, first result keys: " + firstResultKeys + " this result keys: " + oKeys;

    for (let i = 0; i < firstResultKeys.length; i++)
    {
        if (firstResultKeys[i] != oKeys[i])
            throw testRun + " results mismatch, first result keys: " + firstResultKeys + " this result keys: " + oKeys;
    }
}

let count = 20000;

for (let i=0; i < count; i++) {
    let result = runRegExp();
    if (i == 0) {
        firstResult = result;
        firstResultKeys = Object.keys(firstResult);
        continue;
    }

    assertSameAsFirstResult(i, result);
}
