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

import changeCappuccino, * as namespace from "./namespace/drink.js"
import { shouldBe, shouldThrow } from "./resources/assert.js";

shouldBe(typeof namespace, 'object');
shouldBe(typeof changeCappuccino, 'function');
shouldBe(namespace.Cocoa, 'Cocoa');
shouldBe(namespace.Cappuccino, 'Cappuccino');
shouldBe(namespace.Matcha, 'Matcha');
shouldBe(namespace.Mocha, 'Mocha');
shouldBe(namespace.default, changeCappuccino);

changeCappuccino('Cocoa');
shouldBe(namespace.Cocoa, 'Cocoa');
shouldBe(namespace.Cappuccino, 'Cocoa');
shouldBe(namespace.Matcha, 'Matcha');
shouldBe(namespace.Mocha, 'Mocha');
shouldBe(namespace.default, changeCappuccino);

shouldBe('Cocoa' in namespace, true);
shouldBe('Cappuccino' in namespace, true);
shouldBe('Matcha' in namespace, true);
shouldBe('Mocha' in namespace, true);
shouldBe('default' in namespace, true);
shouldBe(Symbol.iterator in namespace, false);
shouldBe('Tea' in namespace, false);

shouldBe(namespace.__proto__, undefined);
shouldBe(Reflect.isExtensible(namespace), false);

shouldBe(Reflect.set(namespace, 'Extended', 42), false);
shouldBe('Extended' in namespace, false);

shouldBe(Reflect.set(namespace, 42, 42), false);
shouldBe(42 in namespace, false);

shouldThrow(() => {
    namespace.value = 20;
}, `TypeError: Attempted to assign to readonly property.`);

shouldThrow(() => {
    namespace[20] = 20;
}, `TypeError: Attempted to assign to readonly property.`);

shouldThrow(() => {
    namespace[Symbol.unscopables] = 20;
}, `TypeError: Attempted to assign to readonly property.`);

shouldThrow(() => {
    Object.defineProperty(namespace, 'Cookie', {
        value: 42
    });
}, `TypeError: Attempting to define property on object that is not extensible.`);

shouldThrow(() => {
    namespace.__proto__ = Object.prototype;
}, `TypeError: Attempted to assign to readonly property.`);

shouldBe(Reflect.setPrototypeOf(namespace, Object.prototype), false);
shouldBe(namespace.__proto__, undefined);
shouldBe(Reflect.getPrototypeOf(namespace), null);

// These names should be shown in the code point order.
shouldBe(JSON.stringify(Object.getOwnPropertyNames(namespace)), `["Cappuccino","Cocoa","Matcha","Mocha","default"]`);
shouldBe(Object.getOwnPropertySymbols(namespace).length, 1);
shouldBe(Object.getOwnPropertySymbols(namespace)[0], Symbol.toStringTag);

// The imported binding properties of the namespace object seen as writable, but, it does not mean that it is writable by users.
shouldBe(JSON.stringify(Reflect.getOwnPropertyDescriptor(namespace, "Cocoa")), `{"value":"Cocoa","writable":true,"enumerable":true,"configurable":false}`);
shouldBe(JSON.stringify(Reflect.getOwnPropertyDescriptor(namespace, "Matcha")), `{"value":"Matcha","writable":true,"enumerable":true,"configurable":false}`);
shouldBe(JSON.stringify(Reflect.getOwnPropertyDescriptor(namespace, "Mocha")), `{"value":"Mocha","writable":true,"enumerable":true,"configurable":false}`);
shouldThrow(() => {
    // Throw an error even if the same value.
    namespace.Cocoa = 'Cocoa';
}, `TypeError: Attempted to assign to readonly property.`);

shouldBe(JSON.stringify(Reflect.getOwnPropertyDescriptor(namespace, Symbol.toStringTag)), `{"value":"Module","writable":false,"enumerable":false,"configurable":false}`);
shouldThrow(() => {
    namespace[Symbol.toStringTag] = 42;
}, `TypeError: Attempted to assign to readonly property.`);

shouldBe(Reflect.deleteProperty(namespace, Symbol.toStringTag), false);
