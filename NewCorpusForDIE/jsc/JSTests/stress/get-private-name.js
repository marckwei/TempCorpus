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

// GetPrivateName should throw when the receiver does not have the requested private property
let i, threw = false;
class C {
    #x = i;
    constructor() { if (i === 30) return { [Symbol.toStringTag]: "without #x"}; }
    static x(obj) { return obj.#x; }
    get [Symbol.toStringTag]() { return "with #x"; }
}

try {
    for (i = 0; i < 50; ++i) {
        let c = new C;
        let result = C.x(c);
        if (result !== i)
            throw new Error(`Expected C.x(${c}) to be ${i}, but found ${result}`);
    }
} catch (e) {
    threw = true;
    if (i !== 30 || e.constructor !== TypeError) {
        throw e;
    }
}

if (!threw)
    throw new Error("Expected TypeError, but no exception was thrown");
