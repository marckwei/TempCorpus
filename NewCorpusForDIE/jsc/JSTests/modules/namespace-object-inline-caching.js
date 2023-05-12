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

import { shouldBe } from "./resources/assert.js";
import * as A from "./namespace-object-inline-caching/a.js"
import * as B from "./namespace-object-inline-caching/b.js"

// unset caching should be disabled for namespace object.
{
    function lookup(ns)
    {
        return ns.hello;
    }
    noInline(lookup);

    shouldBe(A.hello, undefined);
    shouldBe(B.hello, 42);

    for (let i = 0; i < 1e4; ++i)
        shouldBe(lookup(A), undefined);

    shouldBe(lookup(B), 42);
}

// usual caching should be disabled for namespace object.
{
    function lookup(ns)
    {
        return ns.goodbye;
    }
    noInline(lookup);

    shouldBe(A.goodbye, 0);
    shouldBe(B.goodbye, undefined);

    for (let i = 0; i < 1e4; ++i)
        shouldBe(lookup(A), 0);

    shouldBe(lookup(B), undefined);
}
