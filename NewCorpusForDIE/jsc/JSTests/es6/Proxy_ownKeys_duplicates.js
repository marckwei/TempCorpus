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

function handler(key) {
    return {
        getOwnPropertyDescriptor(t, n) {
            // Required to prevent Object.keys() from discarding results
            return {
                enumerable: true,
                configurable: true,
            };
        },
        ownKeys(t) {
            return [key, key];
        }
    };
}

function shouldThrow(op, errorConstructor, desc) {
    try {
        op();
    } catch (e) {
        if (!(e instanceof errorConstructor)) {
            throw new Error(`threw ${e}, but should have thrown ${errorConstructor.name}`);
        }
        return;
    }
    throw new Error(`Expected ${desc || 'operation'} to throw ${errorConstructor.name}, but no exception thrown`);
}

function test() {

var symbol = Symbol("test");
var proxyNamed = new Proxy({}, handler("A"));
var proxyIndexed = new Proxy({}, handler(0));
var proxySymbol = new Proxy({}, handler(symbol));

shouldThrow(() => Object.keys(proxyNamed), TypeError, "Object.keys with duplicate named properties");
shouldThrow(() => Object.keys(proxyIndexed), TypeError, "Object.keys with duplicate indexed properties");
shouldThrow(() => Object.keys(proxySymbol), TypeError, "Object.keys with duplicate symbol properties");

shouldThrow(() => Object.getOwnPropertyNames(proxyNamed), TypeError, "Object.getOwnPropertyNames with duplicate named properties");
shouldThrow(() => Object.getOwnPropertyNames(proxyIndexed), TypeError, "Object.getOwnPropertyNames with duplicate indexed properties");
shouldThrow(() => Object.getOwnPropertyNames(proxySymbol), TypeError, "Object.getOwnPropertyNames with duplicate symbol properties");

shouldThrow(() => Object.getOwnPropertySymbols(proxyNamed), TypeError, "Object.getOwnPropertySymbols with duplicate named properties");
shouldThrow(() => Object.getOwnPropertySymbols(proxyIndexed), TypeError, "Object.getOwnPropertySymbols with duplicate indexed properties");
shouldThrow(() => Object.getOwnPropertySymbols(proxySymbol), TypeError, "Object.getOwnPropertySymbols with duplicate symbol properties");

return true;

}

if (!test())
    throw new Error("Test failed");

