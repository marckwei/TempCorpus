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

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

var symbol = Symbol("Cocoa");

shouldThrow(() => {
    // ToString => error.
    "" + symbol;
}, `TypeError: Cannot convert a symbol to a string`);

shouldThrow(() => {
    // ToNumber => error.
    +symbol;
}, `TypeError: Cannot convert a symbol to a number`);

shouldThrow(() => {
    Symbol.keyFor("Cappuccino");
}, `TypeError: Symbol.keyFor requires that the first argument be a symbol`);

shouldThrow(() => {
    Symbol.prototype.toString.call(null);
}, `TypeError: Symbol.prototype.toString requires that |this| be a symbol or a symbol object`);

shouldThrow(() => {
    Symbol.prototype.toString.call({});
}, `TypeError: Symbol.prototype.toString requires that |this| be a symbol or a symbol object`);

shouldThrow(() => {
    Symbol.prototype.valueOf.call(null);
}, `TypeError: Symbol.prototype.valueOf requires that |this| be a symbol or a symbol object`);

shouldThrow(() => {
    Symbol.prototype.valueOf.call({});
}, `TypeError: Symbol.prototype.valueOf requires that |this| be a symbol or a symbol object`);
