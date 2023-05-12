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

// This file tests is concat spreadable.

function arrayEq(a, b) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}


{
    let o = {0:1, 1:2, 2:3, length:3};

    // Test it works with proxies by default
    for (let i = 0; i < 100000; i++) {
        if (!arrayEq(Array.prototype.concat.call(o,o), [o,o]))
            throw "failed normally with an object"
    }

    // Test it works with spreadable true
    o[Symbol.isConcatSpreadable] = true;
    for (let i = 0; i < 100000; i++) {
        let result = Array.prototype.concat.call(o,o)
        if (!arrayEq(result, [1,2,3,1,2,3]))
            throw "failed with spread got: " + result;
    }

    // Test it works with many things
    o[Symbol.isConcatSpreadable] = true;
    let other = {}
    for (let i = 0; i < 100000; i++) {
        let result = Array.prototype.concat.call(o,o,true,[1,2],other)
        if (!arrayEq(result, [1,2,3,1,2,3,true,1,2,other]))
            throw "failed with spread got: " + result;
    }

    // Test it works with strings
    String.prototype[Symbol.isConcatSpreadable] = true;
    for (let i = 0; i < 100000; i++) {
        let result = Array.prototype.concat.call("hi","hi")
        // This is what the spec says is the correct answer... D:
        if (!arrayEq(result, ["h", "i", "hi"]))
            throw "failed with string got: " + result + " on iteration " + i;
    }
}
