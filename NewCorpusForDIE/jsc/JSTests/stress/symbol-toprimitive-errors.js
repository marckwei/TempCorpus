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

function shouldBe(func, expected) {
    let result = func();
    if (result !== expected)
        throw new Error("bad value");
}

function shouldThrow(func, errorType, message) {
    let errorThrown = false;
    let error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error("not thrown");
    if (!(error instanceof errorType))
        throw new Error("wrong error type thrown: " + error);
    if (error.message !== message)
        throw new Error("wrong message thrown: " + error.message);
}

shouldBe(() => isNaN({}), true);
shouldBe(() => isNaN({[Symbol.toPrimitive]: undefined}), true);
shouldBe(() => isNaN({[Symbol.toPrimitive]: null}), true);
shouldBe(() => isNaN({[Symbol.toPrimitive]() { /* empty */ } }), true);
shouldBe(() => isNaN({[Symbol.toPrimitive]() { return NaN } }), true);
shouldBe(() => isNaN({[Symbol.toPrimitive]() { return 1 } }), false);

shouldThrow(() => { isNaN({[Symbol.toPrimitive]: 1 }) }, TypeError, "Symbol.toPrimitive is not a function, undefined, or null");
shouldThrow(() => { isNaN({[Symbol.toPrimitive]: NaN }) }, TypeError, "Symbol.toPrimitive is not a function, undefined, or null");
shouldThrow(() => { isNaN({[Symbol.toPrimitive]: true }) }, TypeError, "Symbol.toPrimitive is not a function, undefined, or null");
shouldThrow(() => { isNaN({[Symbol.toPrimitive]: "string" }) }, TypeError, "Symbol.toPrimitive is not a function, undefined, or null");
shouldThrow(() => { isNaN({[Symbol.toPrimitive]: Symbol() }) }, TypeError, "Symbol.toPrimitive is not a function, undefined, or null");
shouldThrow(() => { isNaN({[Symbol.toPrimitive]: {} }) }, TypeError, "Symbol.toPrimitive is not a function, undefined, or null");
shouldThrow(() => { isNaN({[Symbol.toPrimitive]: [] }) }, TypeError, "Symbol.toPrimitive is not a function, undefined, or null");
shouldThrow(() => { isNaN({[Symbol.toPrimitive]: /regex/ }) }, TypeError, "Symbol.toPrimitive is not a function, undefined, or null");

shouldThrow(() => { isNaN({[Symbol.toPrimitive]() { return this } }) }, TypeError, "Symbol.toPrimitive returned an object");
shouldThrow(() => { isNaN({[Symbol.toPrimitive]() { return {} } }) }, TypeError, "Symbol.toPrimitive returned an object");
shouldThrow(() => { isNaN({[Symbol.toPrimitive]() { return [] } }) }, TypeError, "Symbol.toPrimitive returned an object");
shouldThrow(() => { isNaN({[Symbol.toPrimitive]() { return /regex/ } }) }, TypeError, "Symbol.toPrimitive returned an object");
shouldThrow(() => { isNaN({[Symbol.toPrimitive]() { return function(){} } }) }, TypeError, "Symbol.toPrimitive returned an object");
shouldThrow(() => { isNaN({[Symbol.toPrimitive]() { return Symbol() } }) }, TypeError, "Cannot convert a symbol to a number");
shouldThrow(() => { isNaN({[Symbol.toPrimitive]() { throw new Error("Inner Error") } }) }, Error, "Inner Error");
