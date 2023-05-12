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

// This tests Object.seal and Object.freeze affect on Symbol properties.

var object = {
    [Symbol.iterator]: 42
};

if (!object.hasOwnProperty(Symbol.iterator))
    throw "Error: object doesn't have Symbol.iterator";
if (JSON.stringify(Object.getOwnPropertyDescriptor(object, Symbol.iterator)) !== '{"value":42,"writable":true,"enumerable":true,"configurable":true}')
    throw "Error: bad property descriptor " + JSON.stringify(Object.getOwnPropertyDescriptor(object, Symbol.iterator));
if (Object.getOwnPropertySymbols(object).length !== 1)
    throw "Error: bad value " + Object.getOwnPropertySymbols(object).length;
if (Object.getOwnPropertySymbols(object)[0] !== Symbol.iterator)
    throw "Error: bad value " + String(Object.getOwnPropertySymbols(object)[0]);

Object.seal(object);
if (!object.hasOwnProperty(Symbol.iterator))
    throw "Error: object doesn't have Symbol.iterator";
if (JSON.stringify(Object.getOwnPropertyDescriptor(object, Symbol.iterator)) !== '{"value":42,"writable":true,"enumerable":true,"configurable":false}')
    throw "Error: bad property descriptor " + JSON.stringify(Object.getOwnPropertyDescriptor(object, Symbol.iterator));

Object.freeze(object);
if (!object.hasOwnProperty(Symbol.iterator))
    throw "Error: object doesn't have Symbol.iterator";
if (JSON.stringify(Object.getOwnPropertyDescriptor(object, Symbol.iterator)) !== '{"value":42,"writable":false,"enumerable":true,"configurable":false}')
    throw "Error: bad property descriptor " + JSON.stringify(Object.getOwnPropertyDescriptor(object, Symbol.iterator));
