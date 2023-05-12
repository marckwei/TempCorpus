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

// This file tests is concat spreadable when taking the fast path
// (single argument, JSArray receiver)

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
    let array = [1,2,3];
    let {proxy:p, revoke} = Proxy.revocable([4, 5], {});

    // Test it works with proxies by default
    for (let i = 0; i < 10000; i++) {
        if (!arrayEq(Array.prototype.concat.call(array, p), [1,2,3,4,5]))
            throw "failed normally with a proxy"
    }

    // Test it works with spreadable false.
    p[Symbol.isConcatSpreadable] = false;
    for (let i = 0; i < 10000; i++) {
        if (!arrayEq(Array.prototype.concat.call(array,p), [1,2,3,p]))
            throw "failed with no spread"
    }

    p[Symbol.isConcatSpreadable] = undefined;
    revoke();
    passed = true;
    try {
        Array.prototype.concat.call(array,p);
        passed = false;
    } catch (e) { }
    if (!passed)
        throw "failed to throw spreading revoked proxy";
}
