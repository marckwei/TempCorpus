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

"use strict";

// This test passes when JSC doesn't crash.

let p = new Proxy(function() { }, {
    apply: function() {
        return bar();
    }
});

function bar() {
    let item = getItem();
    return item.foo;
}

let i;
let shouldReturnBad = false;
let good = [function() {return 1}, {b: 20}, {c: 40}, {d:50}]
let bad = [{asdfhasf: 20}, {e:50}, {j:70}, {k:100}, null];
function getItem() {
    if (shouldReturnBad)
        return bad[i % bad.length];
    return good[i % good.length];
}
noInline(getItem);

function start() {
    for (i = 0; i < 1000; i++) {
        p();
    }

    shouldReturnBad = true;
    for (i = 0; i < 10000; i++) {
        try {
            p();
        } catch(e) { }
    }
}
start();
