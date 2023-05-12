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

// Test changing the value of toStringTag

// Test adding toStringTag to the base with miss.

// SuperPrototype can't be an empty object since its transition
// watchpoint will be clobbered when assigning it to the prototype.
var SuperPrototype = { bar: 1 }
var BasePrototype = { }
Object.setPrototypeOf(BasePrototype, SuperPrototype);

function Base() { }
Base.prototype = BasePrototype;

var value = new Base();

if (value.toString() !== "[object Object]")
    throw "bad miss toStringTag";

value[Symbol.toStringTag] = "hello";

if (value.toString() !== "[object hello]")
    throw "bad swap on base value with miss";

// Test adding toStringTag to the prototype with miss.

value = new Base();

if (value.toString() !== "[object Object]")
    throw "bad miss toStringTag";

SuperPrototype[Symbol.toStringTag] = "superprototype";

if (value.toString() !== "[object superprototype]")
    throw "bad prototype toStringTag change with miss";

// Test adding toStringTag to the base with a hit.

value[Symbol.toStringTag] = "hello2";

if (value.toString() !== "[object hello2]")
    throw "bad swap on base value with hit";

// Test toStringTag on the prototype.

if (Object.getPrototypeOf(value).toString() !== "[object superprototype]")
    throw "bad prototype toStringTag access";

// Test adding to string to the prototype with hit.

value = new Base();

BasePrototype[Symbol.toStringTag] = "baseprototype";

if (value.toString() !== "[object baseprototype]")
    throw "bad prototype toStringTag interception with hit";

// Test replacing the string on prototype.

BasePrototype[Symbol.toStringTag] = "not-baseprototype!";

if (value.toString() !== "[object not-baseprototype!]")
    throw "bad prototype toStringTag interception with hit";
