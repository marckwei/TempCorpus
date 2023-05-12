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

let flag = true;
function o() {
    if (flag)
        return {x:20};
    return {y:20, x:20};
}
noInline(o);

let counter = 0;
function e() {
    if ((++counter) % 50 === 0)
        throw new Error;
}
noInline(e);

let counter2 = 0;
function e2() {
    if ((++counter2) % 2 === 0)
        throw new Error;
}
noInline(e2);

function escape(){ }
noInline(escape);

function baz(o) {
    try {
        e();
        escape(o.x);
    } catch(e) {
        escape(o.x);
        e2();
    } finally {
        o.x;
    }
}
noInline(baz);

{
    let o = {x:20};
    function run() {
        for (let i = 0; i < 1000; ++i) {
            try {
                baz(o);
            } catch { }
        }
    }
    run();
    o = {y:40, x:20};
    run();
}
