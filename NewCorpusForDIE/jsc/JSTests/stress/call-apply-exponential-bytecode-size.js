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

// Currently flaky on mips.
//@ skip if $architecture == "mips"
// This test seems to require 64 MB for the executable memory pool, but only
// arm64 and x86_64 have that much by default.
//@ requireOptions("--jitMemoryReservationSize=67108864") if !["arm64", "x86_64"].include?($architecture)
"use strict";

function assert(b) {
    if (!b)
        throw new Error();
}

const inc = (x, y) => { return x + 1; }
const inc2 = (x, y) => { return y ? y + 1 : x + 1; }
function bar() {
    return inc.call(null, inc.call(null, inc.call(null, inc.call(null,
      inc.call(null, inc.call(null, inc.call(null, inc.call(null,
        inc.call(null, inc.call(null, inc.call(null, inc.call(null,
          inc.call(null, inc.call(null, inc.call(null, inc.call(null,
            inc.call(null, inc.call(null, inc.call(null, inc.call(null,
              inc.call(null, 1)))))))))))))))))))));
}
assert(bar() === 22);

function randomApplyOrCall(bias, size, dontSpreadBias = 0) {
    let cur = `1`;
    for (let i = 0; i < size; ++i) {
        if (Math.random() >= bias) {
            if (Math.random() >= dontSpreadBias)
                cur = `inc.call(null, ${cur})`;
            else
                cur = `inc.call(...[null, ${cur}])`;
        } else {
            if (Math.random() >= dontSpreadBias)
                cur = `inc.apply(null, [${cur}])`;
            else
                cur = `inc.apply(...[null, [${cur}]])`;
        }
    }

    if (bias > 0.85) {
        cur = `let random = ${Math.random()}; ${cur}`;
    }

    return eval(cur);
}

const depth = 100;
assert(randomApplyOrCall(0, depth) === depth + 1);
assert(randomApplyOrCall(1, depth) === depth + 1);
assert(randomApplyOrCall(0, depth, 0) === depth + 1);
assert(randomApplyOrCall(1, depth, 1) === depth + 1);
for (let i = 0; i < 1000; ++i) {
    assert(randomApplyOrCall(Math.random(), depth) === depth + 1);
    assert(randomApplyOrCall(Math.random(), depth + 1, Math.random()) === depth + 2);
}

function baz() {
    return inc.call(null, inc.call(null, inc.call(null, inc.call(null,
      inc.call(null, inc.call(null, inc.call(null, inc.call(null,
        inc.call(null, inc.call(null, inc.call(null, inc.call(null,
          inc.call(null, inc.call(null, inc.call(null, inc.call(null,
            inc.call(null, inc.call(null, inc.call(null, inc.call(null,
              inc.call(null, 1)))))))))))))))))))), 
       inc.call(null, inc.call(null, 1)));
}
assert(baz() === 22);

function jaz() {
    return inc.call(null, inc.call(null, inc.call(null, inc.call(null,
      inc.call(null, inc.call(null, inc.call(null, inc.call(null,
        inc.call(null, inc.call(null, inc.call(null, inc.call(null,
          inc.call(null, inc.call(null, inc.call(null, inc.call(null,
            inc.call(null, inc.apply(null, [inc.call(null, inc.call(null,
              inc.call(null, 1)))]))))))))))))))))),
       inc.call(null, inc.call(null, inc.apply(null, [1]))));
}
assert(jaz() === 22);

function haz() {
    return inc.call(null, inc.call(null, inc.call(null, inc.call(null,
      inc.call(null, inc.call(null, inc.call(null, inc.call(null,
        inc.call(null, inc.call(null, inc.call(null, inc.call(null,
          inc.call(null, inc.call(null, inc.call(null, inc.call(null,
            inc.call(null, inc.apply(null, [inc.call(null, inc.call(null,
              inc.call(null, 1)))]))))))))))))))))),
        inc.call(null, inc.call(null, inc.call(null, inc.call(null,
          inc.call(null, inc.call(null, inc.call(null, inc.call(null,
            inc.call(null, inc.call(null, inc.call(null, inc.call(null,
              inc.call(null, inc.call(null, inc.call(null, inc.call(null,
                inc.call(null, inc.apply(null, [inc.call(null, inc.call(null,
                  inc.call(null, 1)))])))))))))))))))))));
}
assert(haz() === 22);

function foo() {
    return inc2.call(null, inc2.call(null, inc2.call(null, inc2.call(null,
      inc2.call(null, inc2.call(null, inc2.call(null, inc2.call(null,
        inc2.call(null, inc2.call(null, inc2.call(null, inc2.call(null,
          inc2.call(null, inc2.call(null, inc2.call(null, inc2.call(null,
            inc2.call(null, inc2.apply(null, [inc2.call(null, inc2.call(null,
              inc2.call(null, 1)))]))))))))))))))))),
        inc2.call(null, inc2.call(null, inc2.call(null, inc2.call(null,
          inc2.call(null, inc2.call(null, inc2.call(null, inc2.call(null,
            inc2.call(null, inc2.call(null, inc2.call(null, inc2.call(null,
              inc2.call(null, inc2.call(null, inc2.call(null, inc2.call(null,
                inc2.call(null, inc2.apply(null, [inc2.call(null, inc2.call(null,
                  inc2.call(null, inc2.call(null, inc.call(null, 1)))))])))))))))))))))))));
}
assert(foo() === 25);
