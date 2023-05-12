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

// This tests Object.create, Object.defineProperty, Object.defineProperties work with Symbol.

function testSymbol(object) {
    if (!object.hasOwnProperty(Symbol.iterator))
        throw "Error: object doesn't have Symbol.iterator";
    if (object.propertyIsEnumerable(Symbol.iterator))
        throw "Error: Symbol.iterator is defined as enumerable";
    if (JSON.stringify(Object.getOwnPropertyDescriptor(object, Symbol.iterator)) !== '{"value":42,"writable":false,"enumerable":false,"configurable":false}')
        throw "Error: bad property descriptor " + JSON.stringify(Object.getOwnPropertyDescriptor(object, Symbol.iterator));
    if (Object.getOwnPropertySymbols(object).length !== 1)
    throw "Error: bad value " + Object.getOwnPropertySymbols(object).length;
    if (Object.getOwnPropertySymbols(object)[0] !== Symbol.iterator)
        throw "Error: bad value " + String(Object.getOwnPropertySymbols(object)[0]);
}

var object = Object.create(Object.prototype, {
    [Symbol.iterator]: {
        value: 42
    }
});
testSymbol(object);

var object = Object.defineProperties({}, {
    [Symbol.iterator]: {
        value: 42
    }
});
testSymbol(object);

var object = Object.defineProperty({}, Symbol.iterator, {
    value: 42
});
testSymbol(object);
