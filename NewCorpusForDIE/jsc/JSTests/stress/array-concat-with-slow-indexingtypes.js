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

    array = [1,2];
    Object.defineProperty(array, 2, { get: () => { return 1; } });

    for (let i = 0; i < 100000; i++) {
        if (!arrayEq(Array.prototype.concat.call(array,array), [1,2,1,1,2,1]))
            throw "failed normally with a getter"
        if (!arrayEq(Array.prototype.concat.call([],array), [1,2,1]))
            throw "failed with undecided and a getter"
    }

    // Test with indexed types on prototype.
    array = [1,2];
    array.length = 3;
    Array.prototype[2] = 1;

    for (let i = 0; i < 100000; i++) {
        if (!arrayEq(Array.prototype.concat.call(array,array), [1,2,1,1,2,1]))
            throw "failed normally with an indexed prototype"
        if (!arrayEq(Array.prototype.concat.call([],array), [1,2,1]))
            throw "failed with undecided and an indexed prototype"
    }
}
