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

import { variable, constVariable, letVariable, functionDeclaration, classDeclaration } from "./imported-bindings-are-immutable/bindings.js"
import { shouldBe, shouldThrow } from "./resources/assert.js"

shouldBe(variable, 'Cocoa');
shouldThrow(() => {
    variable = 42;
}, `TypeError: Attempted to assign to readonly property.`);

shouldBe(constVariable, 'Cocoa');
shouldThrow(() => {
    constVariable = 42;
}, `TypeError: Attempted to assign to readonly property.`);

shouldBe(letVariable, 'Cocoa');
shouldThrow(() => {
    letVariable = 42;
}, `TypeError: Attempted to assign to readonly property.`);

shouldBe(typeof functionDeclaration, 'function');
shouldThrow(() => {
    functionDeclaration = 42;
}, `TypeError: Attempted to assign to readonly property.`);

shouldBe(typeof classDeclaration, 'function');
shouldThrow(() => {
    classDeclaration = 42;
}, `TypeError: Attempted to assign to readonly property.`);


function reference(read) {
    if (read)
        return letVariable;
    else
        letVariable = "Cocoa";
}
noInline(reference);

for (var i = 0; i < 10000; ++i)
    reference(true);

shouldThrow(() => {
    reference(false);
}, `TypeError: Attempted to assign to readonly property.`);
