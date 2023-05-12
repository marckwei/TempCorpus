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

import { shouldBe, shouldThrow } from "./resources/assert.js";
import * as ns from "./arbitrary-module-names/export-indexed.js";

(() => {
    for (let i = 0; i < 1e5; i++) {
        shouldBe(ns[0], 0);
        shouldBe(Reflect.get(ns, 1), 1);
        shouldBe(ns[2], undefined);

        shouldThrow(() => { ns[0] = 1; }, `TypeError: Attempted to assign to readonly property.`);
        shouldBe(Reflect.set(ns, 1, 1), false);
        shouldThrow(() => { ns[2] = 2; }, `TypeError: Attempted to assign to readonly property.`);

        shouldBe(0 in ns, true);
        shouldBe(Reflect.has(ns, 1), true);
        shouldBe(2 in ns, false);

        shouldThrow(() => { delete ns[0]; }, `TypeError: Unable to delete property.`);
        shouldBe(Reflect.deleteProperty(ns, 1), false);
        shouldBe(delete ns[2], true);
    }
})();
