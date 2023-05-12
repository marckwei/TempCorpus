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

function shouldThrow(func, expectedError) {
    let actualError;
    try {
        func();
    } catch (error) {
        actualError = error;
    }
    if (actualError !== expectedError)
        throw new Error(`bad error: ${actualError}`);
}

const iter = {
    [Symbol.iterator]() { return this; },
    next() { return { value: [], done: false }; },
    get return() { throw 'return'; },
};

Map.prototype.set = () => { throw 'set'; };
Set.prototype.add = () => { throw 'add'; };
WeakMap.prototype.set = () => { throw 'set'; };
WeakSet.prototype.add = () => { throw 'add'; };

for (let i = 0; i < 1e4; ++i) {
    shouldThrow(() => new Map(iter), 'set');
    shouldThrow(() => new Set(iter), 'add');
    shouldThrow(() => new WeakMap(iter), 'set');
    shouldThrow(() => new WeakSet(iter), 'add');
}
