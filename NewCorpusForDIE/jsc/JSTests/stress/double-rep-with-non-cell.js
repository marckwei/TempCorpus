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

// Only bool, undefined and null
function addNullBoolUndefined(a, b) {
    return a + b;
}
noInline(addNullBoolUndefined);

for (var i = 0; i < 1e4; ++i) {
    var value = addNullBoolUndefined(0.5, null);
    if (value !== 0.5)
        throw "addNullBoolUndefined(0.5, null) failed with i = " + i + " returned value = " + value;

    var value = addNullBoolUndefined(null, undefined);
    if (value === value)
        throw "addNullBoolUndefined(null, undefined) failed with i = " + i + " returned value = " + value;

    var value = addNullBoolUndefined(true, null);
    if (value !== 1)
        throw "addNullBoolUndefined(true, null) failed with i = " + i + " returned value = " + value;

    var value = addNullBoolUndefined(undefined, false);
    if (value === value)
        throw "addNullBoolUndefined(undefined, false) failed with i = " + i + " returned value = " + value;

    var value = addNullBoolUndefined(false, true);
    if (value !== 1)
        throw "addNullBoolUndefined(false, true) failed with i = " + i + " returned value = " + value;

    var value = addNullBoolUndefined(null, 42);
    if (value !== 42)
        throw "addNullBoolUndefined(null, 42) failed with i = " + i + " returned value = " + value;

}
