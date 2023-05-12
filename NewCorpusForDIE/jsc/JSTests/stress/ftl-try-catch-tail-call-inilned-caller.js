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

// This test ensures the TailCallInilnedCaller has the correct
// stack trace in the FTL inside a try block.
// This case arises when you have a situation like this:
// foo makes a call to bar, bar is inlined in foo. bar makes a call
// to baz and baz is inlined in bar. And then baz makes a tail-call to jaz,
// and jaz is inlined in baz. We want the callframe for jaz to appear to 
// have caller be bar. 


"use strict";
function value() {
    return "value";
}
noInline(value);

function assert(b) {
    if (!b)
        throw new Error("bad value");
}
noInline(assert);

function validate(stack) {
    let arr = stack.split("\n");
    assert(arr[0].indexOf("jaz") !== -1);
    assert(arr[1].indexOf("bar") !== -1);
    assert(arr[2].indexOf("foo") !== -1);
}

function foo() {
    let v = value();
    try {
        return bar() + 1;
    } catch(e) {
        assert(v === "value");
        validate(e.stack);
    }
}
noInline(foo);

function bar() {
    return baz() + 1;
}

function baz() { 
    return jaz();
}

let flag = false;
function jaz() { 
    if (flag)
        throw new Error("lol");
    return 20; 
}
noInline(jaz);

for (var i = 0; i < 50000; i++) {
    foo();
}
flag = true;
foo();
