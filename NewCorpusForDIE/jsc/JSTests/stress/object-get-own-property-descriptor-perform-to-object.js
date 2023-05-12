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

var primitives = [
    ["string", 6],
    [42, undefined],
    [Symbol("symbol"), undefined],
    [true, undefined],
    [false, undefined]
];

for (var [primitive, expected] of primitives) {
    var ret = Object.getOwnPropertyDescriptor(primitive, 'length');
    if (expected === undefined) {
        if (ret !== expected)
            throw new Error("bad value for " + String(primitive) + ": " + String(ret));
    } else if (ret.value !== expected)
        throw new Error("bad value for " + String(primitive) + ": " + String(ret));
}

function canary() {
    return {
        called: false,
        toString() {
            this.called = true;
            throw new Error("out");
        }
    };
}

[
    [ null, "TypeError: null is not an object (evaluating 'Object.getOwnPropertyDescriptor(value, property)')" ],
    [ undefined, "TypeError: undefined is not an object (evaluating 'Object.getOwnPropertyDescriptor(value, property)')" ]
].forEach(function ([value, message]) {
    var property = canary();
    var error = null;
    try {
        Object.getOwnPropertyDescriptor(value, property);
    } catch (e) {
        error = e;
    }
    if (!error)
        throw new Error("error not thrown");
    if (String(error) !== message)
        throw new Error("bad error: " + String(error));
});
