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

import { Cocoa, Cappuccino, Matcha } from "./scopes/drink.js"
import { shouldBe } from "./resources/assert.js";

var global = Function("return this")();
var globalEval = (0, eval);
global.Cappuccino = 'Global Scope';

{
    let Cocoa = 42;
    shouldBe(Cocoa, 42);
}
shouldBe(Cocoa, 'Cocoa');
shouldBe(Cappuccino, 'Cappuccino'); // Module Scope.
shouldBe(Matcha, 'Matcha');

(function () {
    var Cocoa = 42;
    let Cappuccino = 'Function Scope';
    shouldBe(Cocoa, 42);
    shouldBe(Cappuccino, 'Function Scope');
    shouldBe(Matcha, 'Matcha');
    {
        let Cappuccino = 'Block Scope';
        const Matcha = 50;
        shouldBe(Matcha, 50);
        shouldBe(Object, global.Object);
        {
            (function () {
                shouldBe(Cappuccino, 'Block Scope');
                shouldBe(globalEval(`Cappuccino`), 'Global Scope');
                shouldBe(Function(`return Cappuccino`)(), 'Global Scope');
            }());
        }
    }
    shouldBe(Object, global.Object);
}());
shouldBe(Object, global.Object);
