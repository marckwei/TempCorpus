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

C = class extends Promise { }
N = class { }
N[Symbol.species] = function() { throw "this should never be called"; }

function id(x) { return x; }

testFunctions = [
    [Promise.prototype.then, [id]]
];

objProp = Object.defineProperty;

function funcThrows(func, args) {
    try {
        func.call(...args)
        return false;
    } catch (e) {
        return true;
    }
}

function makeC() {
    return new C(function(resolve) { resolve(1); });
}

function test(testData) {
    "use strict";
    let [protoFunction, args] = testData;
    let foo = makeC()
    let n = new N();

    // Test promise defaults cases.
    foo = makeC();

    objProp(C, Symbol.species, { value: undefined, writable: true});
    let bar = protoFunction.call(foo, ...args);
    if (!(bar instanceof Promise) || bar instanceof C)
        throw Error();

    C[Symbol.species] = null;
    bar = protoFunction.call(foo, ...args);
    if (!(bar instanceof Promise) || bar instanceof C)
        throw Error();

    // Test species is custom constructor.
    let called = false;
    function species() {
        called = true;
        return new C(...arguments);
    }

    C[Symbol.species] = species;
    bar = protoFunction.call(foo, ...args);

    if (!(bar instanceof Promise) || !(bar instanceof C) || !called)
        throw Error("failed on " + protoFunction);

    function speciesThrows() {
        throw Error();
    }

    C[Symbol.species] = speciesThrows;
    if (!funcThrows(protoFunction, [foo, ...args]))
        throw "didn't throw";

    C[Symbol.species] = true;
    if (!funcThrows(protoFunction, [foo, ...args]))
        throw "didn't throw";

}

testFunctions.forEach(test);
