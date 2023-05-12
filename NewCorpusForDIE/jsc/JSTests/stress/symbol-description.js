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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`bad value: ${String(actual)}`);
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

var s0 = Symbol("Cocoa");
var s1 = Symbol("Cappuccino");
var s2 = Symbol("");
var s3 = Symbol();

shouldBe(s0.description, "Cocoa");
shouldBe(s0.toString(), "Symbol(Cocoa)");
shouldBe(s1.description, "Cappuccino");
shouldBe(s1.toString(), "Symbol(Cappuccino)");
shouldBe(s2.description, "");
shouldBe(s2.toString(), "Symbol()");
shouldBe(s3.description, undefined);
shouldBe(s3.toString(), "Symbol()");

var o0 = Object(s0);
var o1 = Object(s1);
var o2 = Object(s2);
var o3 = Object(s3);

shouldBe(o0.description, "Cocoa");
shouldBe(o0.toString(), "Symbol(Cocoa)");
shouldBe(o1.description, "Cappuccino");
shouldBe(o1.toString(), "Symbol(Cappuccino)");
shouldBe(o2.description, "");
shouldBe(o2.toString(), "Symbol()");
shouldBe(o3.description, undefined);
shouldBe(o3.toString(), "Symbol()");

var descriptor = Object.getOwnPropertyDescriptor(Symbol.prototype, "description");
shouldBe(descriptor.enumerable, false);
shouldBe(descriptor.configurable, true);
shouldBe(descriptor.set, undefined);
shouldBe(typeof descriptor.get, "function");

shouldThrow(() => {
    "use strict";
    s0.description = "Matcha";
}, `TypeError: Attempted to assign to readonly property.`);
shouldThrow(() => {
    "use strict";
    o0.description = "Matcha";
}, `TypeError: Attempted to assign to readonly property.`);

shouldThrow(() => {
    descriptor.get.call({});
}, `TypeError: Symbol.prototype.description requires that |this| be a symbol or a symbol object`);

shouldThrow(() => {
    descriptor.get.call(null);
}, `TypeError: Symbol.prototype.description requires that |this| be a symbol or a symbol object`);

shouldThrow(() => {
    descriptor.get.call(undefined);
}, `TypeError: Symbol.prototype.description requires that |this| be a symbol or a symbol object`);

shouldThrow(() => {
    descriptor.get.call(42);
}, `TypeError: Symbol.prototype.description requires that |this| be a symbol or a symbol object`);

shouldThrow(() => {
    descriptor.get.call("Hello");
}, `TypeError: Symbol.prototype.description requires that |this| be a symbol or a symbol object`);

shouldThrow(() => {
    descriptor.get.call(42.195);
}, `TypeError: Symbol.prototype.description requires that |this| be a symbol or a symbol object`);

shouldThrow(() => {
    descriptor.get.call(false);
}, `TypeError: Symbol.prototype.description requires that |this| be a symbol or a symbol object`);

shouldBe(descriptor.get.call(s0), "Cocoa");
shouldBe(descriptor.get.call(o0), "Cocoa");
o0.__proto__ = {};
shouldBe(descriptor.get.call(o0), "Cocoa");
