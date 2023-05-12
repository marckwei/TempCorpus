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

import { shouldBe, shouldThrow, shouldNotThrow } from "./resources/assert.js"
import * as ns from "./module-namespace-object-define-own-property/module.js"

shouldThrow(() => {
    Object.defineProperty(ns, Symbol.unscopables, {
        value: 42
    });
}, `TypeError: Attempting to define property on object that is not extensible.`);

shouldThrow(() => {
    Object.defineProperty(ns, Symbol.toStringTag, {
        value: 42
    });
}, `TypeError: Attempting to change value of a readonly property.`);

shouldThrow(() => {
    Object.defineProperty(ns, "variable", {
        get: function () { }
    });
}, `TypeError: Cannot change module namespace object's binding to accessor`);

shouldThrow(() => {
    Object.defineProperty(ns, "variable", {
        writable: false
    });
}, `TypeError: Cannot change module namespace object's binding to non-writable attribute`);

shouldThrow(() => {
    Object.defineProperty(ns, "variable", {
        enumerable: false
    });
}, `TypeError: Cannot replace module namespace object's binding with non-enumerable attribute`);

shouldThrow(() => {
    Object.defineProperty(ns, "variable", {
        configurable: true
    });
}, `TypeError: Cannot replace module namespace object's binding with configurable attribute`);

shouldThrow(() => {
    Object.defineProperty(ns, "variable", {
        value: 43
    });
}, `TypeError: Cannot replace module namespace object's binding's value`);

shouldNotThrow(() => {
    Reflect.defineProperty(ns, "variable", { value: 42 });
});

shouldBe(Reflect.defineProperty(ns, "variable", { value: 42 }), true);
