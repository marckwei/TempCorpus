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

// Eval's goal symbol is Script, not Module.
shouldBe(eval(`
<!-- ok
--> ok
42
`), 42);

// Function's goal symbol is not Module.
shouldBe(new Function(`
<!-- ok
--> ok
return 42
`)(), 42);

shouldThrow(() => {
    checkModuleSyntax(`
    <!-- ng -->
    `)
}, `SyntaxError: Unexpected token '<':2`);

shouldThrow(() => {
    checkModuleSyntax(`
-->
    `)
}, `SyntaxError: Unexpected token '>':2`);

shouldThrow(() => {
    checkModuleSyntax(`
    function hello()
    {
        <!-- ng -->
    }
    `)
}, `SyntaxError: Unexpected token '<':4`);

shouldThrow(() => {
    checkModuleSyntax(`
    function hello()
    {
-->
    }
    `)
}, `SyntaxError: Unexpected token '>':4`);
