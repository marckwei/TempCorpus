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

class A extends Array { }
Object.defineProperty(Array, Symbol.species, { value: A, configurable: true });

foo = [1,2,3,4];
result = foo.concat([1]);
if (!(result instanceof A))
    throw "concat failed";

result = foo.splice();
if (!(result instanceof A))
    throw "splice failed";

result = foo.slice();
if (!(result instanceof A))
    throw "slice failed";

Object.defineProperty(Array, Symbol.species, { value: Int32Array, configurable: true });

// We can't write to the length property on a typed array by default.
Object.defineProperty(Int32Array.prototype, "length", { value: 0, writable: true });

function shouldThrow(f, m) {
    let err;
    try {
        f();
    } catch(e) {
        err = e;
    }
    if (err.toString() !== m)
        throw new Error("Wrong error: " + err);
}

function test() {
    shouldThrow(() => {
        foo.concat([1]);
    }, "TypeError: Attempting to store out-of-bounds property on a typed array at index: 0");
    foo = [1,2,3,4];
    foo.slice(0);
    foo = [1,2,3,4];
    let r = foo.splice();
    if (!(r instanceof Int32Array))
        throw "Bad";
    if (r.length !== 0)
        throw "Bad";
    foo = [1,2,3,4];
    foo.splice(0);
}
noInline(test);
for (let i = 0; i < 3000; ++i)
    test();
