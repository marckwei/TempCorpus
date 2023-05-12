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

// Copyright (C) 2017 Robin Templeton. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

function assert(a) {
    if (!a)
        throw new Error("Bad assertion");
}

assert.sameValue = function (input, expected, message) {
    if (input !== expected)
        throw new Error(message);
}

function testMod(x, y, z) {
    assert.sameValue(x % y, z, x + " % " + y + " = " + z);
}

testMod(0xFEDCBA9876543210n, 0xFEDCBA9876543210n, 0x0n);
testMod(0xFEDCBA9876543210n, 0xFEDCBA987654320Fn, 0x1n);
testMod(0xFEDCBA9876543210n, 0xFEDCBA98n, 0x76543210n);
testMod(0xFEDCBA9876543210n, 0xFEDCBA97n, 0x77777779n);
testMod(0xFEDCBA9876543210n, 0x1234n, 0x960n);
testMod(0xFEDCBA9876543210n, 0x3n, 0x0n);
testMod(0xFEDCBA9876543210n, 0x2n, 0x0n);
testMod(0xFEDCBA9876543210n, 0x1n, 0x0n);
testMod(0xFEDCBA9876543210n, BigInt("-1"), 0x0n);
testMod(0xFEDCBA9876543210n, BigInt("-2"), 0x0n);
testMod(0xFEDCBA9876543210n, BigInt("-3"), 0x0n);
testMod(0xFEDCBA9876543210n, BigInt("-4660"), 0x960n);
testMod(0xFEDCBA9876543210n, BigInt("-4275878551"), 0x77777779n);
testMod(0xFEDCBA9876543210n, BigInt("-4275878552"), 0x76543210n);
testMod(0xFEDCBA9876543210n, BigInt("-18364758544493064719"), 0x1n);
testMod(0xFEDCBA987654320Fn, 0xFEDCBA9876543210n, 0xFEDCBA987654320Fn);
testMod(0xFEDCBA987654320Fn, 0xFEDCBA987654320Fn, 0x0n);
testMod(0xFEDCBA987654320Fn, 0xFEDCBA98n, 0x7654320Fn);
testMod(0xFEDCBA987654320Fn, 0xFEDCBA97n, 0x77777778n);
testMod(0xFEDCBA987654320Fn, 0x1234n, 0x95Fn);
testMod(0xFEDCBA987654320Fn, 0x3n, 0x2n);
testMod(0xFEDCBA987654320Fn, 0x2n, 0x1n);
testMod(0xFEDCBA987654320Fn, 0x1n, 0x0n);
testMod(0xFEDCBA987654320Fn, BigInt("-1"), 0x0n);
testMod(0xFEDCBA987654320Fn, BigInt("-3"), 0x2n);
testMod(0xFEDCBA987654320Fn, BigInt("-4660"), 0x95Fn);
testMod(0xFEDCBA987654320Fn, BigInt("-4275878551"), 0x77777778n);
testMod(0xFEDCBA987654320Fn, BigInt("-18364758544493064720"), 0xFEDCBA987654320Fn);
testMod(0xFEDCBA98n, 0xFEDCBA9876543210n, 0xFEDCBA98n);
testMod(0xFEDCBA98n, 0xFEDCBA987654320Fn, 0xFEDCBA98n);
testMod(0xFEDCBA98n, 0xFEDCBA98n, 0x0n);
testMod(0xFEDCBA98n, 0xFEDCBA97n, 0x1n);
testMod(0xFEDCBA98n, 0x1234n, 0x930n);
testMod(0xFEDCBA98n, 0x3n, 0x2n);
testMod(0xFEDCBA98n, 0x2n, 0x0n);
testMod(0xFEDCBA98n, 0x1n, 0x0n);
testMod(0xFEDCBA98n, BigInt("-1"), 0x0n);
testMod(0xFEDCBA98n, BigInt("-2"), 0x0n);
testMod(0xFEDCBA98n, BigInt("-3"), 0x2n);
testMod(0xFEDCBA98n, BigInt("-4660"), 0x930n);
testMod(0xFEDCBA98n, BigInt("-4275878551"), 0x1n);
testMod(0xFEDCBA98n, BigInt("-4275878552"), 0x0n);
testMod(0xFEDCBA98n, BigInt("-18364758544493064719"), 0xFEDCBA98n);
testMod(0xFEDCBA98n, BigInt("-18364758544493064720"), 0xFEDCBA98n);
testMod(0xFEDCBA97n, 0xFEDCBA9876543210n, 0xFEDCBA97n);
testMod(0xFEDCBA97n, 0xFEDCBA987654320Fn, 0xFEDCBA97n);
testMod(0xFEDCBA97n, 0xFEDCBA98n, 0xFEDCBA97n);
testMod(0xFEDCBA97n, 0xFEDCBA97n, 0x0n);
testMod(0xFEDCBA97n, 0x1234n, 0x92Fn);
testMod(0xFEDCBA97n, 0x3n, 0x1n);
testMod(0xFEDCBA97n, 0x2n, 0x1n);
testMod(0xFEDCBA97n, 0x1n, 0x0n);
testMod(0xFEDCBA97n, BigInt("-1"), 0x0n);
testMod(0xFEDCBA97n, BigInt("-2"), 0x1n);
testMod(0xFEDCBA97n, BigInt("-3"), 0x1n);
testMod(0xFEDCBA97n, BigInt("-4660"), 0x92Fn);
testMod(0xFEDCBA97n, BigInt("-4275878551"), 0x0n);
testMod(0xFEDCBA97n, BigInt("-4275878552"), 0xFEDCBA97n);
testMod(0xFEDCBA97n, BigInt("-18364758544493064719"), 0xFEDCBA97n);
testMod(0xFEDCBA97n, BigInt("-18364758544493064720"), 0xFEDCBA97n);
testMod(0x1234n, 0xFEDCBA9876543210n, 0x1234n);
testMod(0x1234n, 0xFEDCBA987654320Fn, 0x1234n);
testMod(0x1234n, 0xFEDCBA98n, 0x1234n);
testMod(0x1234n, 0xFEDCBA97n, 0x1234n);
testMod(0x1234n, 0x1234n, 0x0n);
testMod(0x1234n, 0x3n, 0x1n);
testMod(0x1234n, 0x2n, 0x0n);
testMod(0x1234n, 0x1n, 0x0n);
testMod(0x1234n, BigInt("-1"), 0x0n);
testMod(0x1234n, BigInt("-2"), 0x0n);
testMod(0x1234n, BigInt("-3"), 0x1n);
testMod(0x1234n, BigInt("-4660"), 0x0n);
testMod(0x1234n, BigInt("-4275878551"), 0x1234n);
testMod(0x1234n, BigInt("-4275878552"), 0x1234n);
testMod(0x1234n, BigInt("-18364758544493064719"), 0x1234n);
testMod(0x1234n, BigInt("-18364758544493064720"), 0x1234n);
testMod(0x3n, 0xFEDCBA9876543210n, 0x3n);
testMod(0x3n, 0xFEDCBA987654320Fn, 0x3n);
testMod(0x3n, 0xFEDCBA98n, 0x3n);
testMod(0x3n, 0xFEDCBA97n, 0x3n);
testMod(0x3n, 0x1234n, 0x3n);
testMod(0x3n, 0x3n, 0x0n);
testMod(0x3n, 0x2n, 0x1n);
testMod(0x3n, 0x1n, 0x0n);
testMod(0x3n, BigInt("-1"), 0x0n);
testMod(0x3n, BigInt("-2"), 0x1n);
testMod(0x3n, BigInt("-3"), 0x0n);
testMod(0x3n, BigInt("-4660"), 0x3n);
testMod(0x3n, BigInt("-4275878551"), 0x3n);
testMod(0x3n, BigInt("-4275878552"), 0x3n);
testMod(0x3n, BigInt("-18364758544493064719"), 0x3n);
testMod(0x3n, BigInt("-18364758544493064720"), 0x3n);
testMod(0x2n, 0xFEDCBA9876543210n, 0x2n);
testMod(0x2n, 0xFEDCBA987654320Fn, 0x2n);
testMod(0x2n, 0xFEDCBA98n, 0x2n);
testMod(0x2n, 0xFEDCBA97n, 0x2n);
testMod(0x2n, 0x1234n, 0x2n);
testMod(0x2n, 0x3n, 0x2n);
testMod(0x2n, 0x2n, 0x0n);
testMod(0x2n, 0x1n, 0x0n);
testMod(0x2n, BigInt("-1"), 0x0n);
testMod(0x2n, BigInt("-2"), 0x0n);
testMod(0x2n, BigInt("-3"), 0x2n);
testMod(0x2n, BigInt("-4660"), 0x2n);
testMod(0x2n, BigInt("-4275878551"), 0x2n);
testMod(0x2n, BigInt("-4275878552"), 0x2n);
testMod(0x2n, BigInt("-18364758544493064719"), 0x2n);
testMod(0x2n, BigInt("-18364758544493064720"), 0x2n);
testMod(0x1n, 0xFEDCBA9876543210n, 0x1n);
testMod(0x1n, 0xFEDCBA987654320Fn, 0x1n);
testMod(0x1n, 0xFEDCBA98n, 0x1n);
testMod(0x1n, 0xFEDCBA97n, 0x1n);
testMod(0x1n, 0x1234n, 0x1n);
testMod(0x1n, 0x3n, 0x1n);
testMod(0x1n, 0x2n, 0x1n);
testMod(0x1n, 0x1n, 0x0n);
testMod(0x1n, BigInt("-1"), 0x0n);
testMod(0x1n, BigInt("-2"), 0x1n);
testMod(0x1n, BigInt("-3"), 0x1n);
testMod(0x1n, BigInt("-4660"), 0x1n);
testMod(0x1n, BigInt("-4275878551"), 0x1n);
testMod(0x1n, BigInt("-4275878552"), 0x1n);
testMod(0x1n, BigInt("-18364758544493064719"), 0x1n);
testMod(0x1n, BigInt("-18364758544493064720"), 0x1n);
testMod(BigInt("-1"), 0xFEDCBA9876543210n, BigInt("-1"));
testMod(BigInt("-1"), 0xFEDCBA987654320Fn, BigInt("-1"));
testMod(BigInt("-1"), 0xFEDCBA98n, BigInt("-1"));
testMod(BigInt("-1"), 0xFEDCBA97n, BigInt("-1"));
testMod(BigInt("-1"), 0x1234n, BigInt("-1"));
testMod(BigInt("-1"), 0x3n, BigInt("-1"));
testMod(BigInt("-1"), 0x2n, BigInt("-1"));
testMod(BigInt("-1"), 0x1n, 0x0n);
testMod(BigInt("-1"), BigInt("-1"), 0x0n);
testMod(BigInt("-1"), BigInt("-2"), BigInt("-1"));
testMod(BigInt("-1"), BigInt("-3"), BigInt("-1"));
testMod(BigInt("-1"), BigInt("-4660"), BigInt("-1"));
testMod(BigInt("-1"), BigInt("-4275878551"), BigInt("-1"));
testMod(BigInt("-1"), BigInt("-4275878552"), BigInt("-1"));
testMod(BigInt("-1"), BigInt("-18364758544493064719"), BigInt("-1"));
testMod(BigInt("-1"), BigInt("-18364758544493064720"), BigInt("-1"));
testMod(BigInt("-2"), 0xFEDCBA9876543210n, BigInt("-2"));
testMod(BigInt("-2"), 0xFEDCBA987654320Fn, BigInt("-2"));
testMod(BigInt("-2"), 0xFEDCBA98n, BigInt("-2"));
testMod(BigInt("-2"), 0xFEDCBA97n, BigInt("-2"));
testMod(BigInt("-2"), 0x1234n, BigInt("-2"));
testMod(BigInt("-2"), 0x3n, BigInt("-2"));
testMod(BigInt("-2"), 0x2n, 0x0n);
testMod(BigInt("-2"), 0x1n, 0x0n);
testMod(BigInt("-2"), BigInt("-1"), 0x0n);
testMod(BigInt("-2"), BigInt("-2"), 0x0n);
testMod(BigInt("-2"), BigInt("-3"), BigInt("-2"));
testMod(BigInt("-2"), BigInt("-4660"), BigInt("-2"));
testMod(BigInt("-2"), BigInt("-4275878551"), BigInt("-2"));
testMod(BigInt("-2"), BigInt("-4275878552"), BigInt("-2"));
testMod(BigInt("-2"), BigInt("-18364758544493064719"), BigInt("-2"));
testMod(BigInt("-2"), BigInt("-18364758544493064720"), BigInt("-2"));
testMod(BigInt("-3"), 0xFEDCBA9876543210n, BigInt("-3"));
testMod(BigInt("-3"), 0xFEDCBA987654320Fn, BigInt("-3"));
testMod(BigInt("-3"), 0xFEDCBA98n, BigInt("-3"));
testMod(BigInt("-3"), 0xFEDCBA97n, BigInt("-3"));
testMod(BigInt("-3"), 0x1234n, BigInt("-3"));
testMod(BigInt("-3"), 0x3n, 0x0n);
testMod(BigInt("-3"), 0x2n, BigInt("-1"));
testMod(BigInt("-3"), 0x1n, 0x0n);
testMod(BigInt("-3"), BigInt("-1"), 0x0n);
testMod(BigInt("-3"), BigInt("-2"), BigInt("-1"));
testMod(BigInt("-3"), BigInt("-3"), 0x0n);
testMod(BigInt("-3"), BigInt("-4660"), BigInt("-3"));
testMod(BigInt("-3"), BigInt("-4275878551"), BigInt("-3"));
testMod(BigInt("-3"), BigInt("-4275878552"), BigInt("-3"));
testMod(BigInt("-3"), BigInt("-18364758544493064719"), BigInt("-3"));
testMod(BigInt("-3"), BigInt("-18364758544493064720"), BigInt("-3"));
testMod(BigInt("-4660"), 0xFEDCBA9876543210n, BigInt("-4660"));
testMod(BigInt("-4660"), 0xFEDCBA987654320Fn, BigInt("-4660"));
testMod(BigInt("-4660"), 0xFEDCBA98n, BigInt("-4660"));
testMod(BigInt("-4660"), 0xFEDCBA97n, BigInt("-4660"));
testMod(BigInt("-4660"), 0x1234n, 0x0n);
testMod(BigInt("-4660"), 0x3n, BigInt("-1"));
testMod(BigInt("-4660"), 0x2n, 0x0n);
testMod(BigInt("-4660"), 0x1n, 0x0n);
testMod(BigInt("-4660"), BigInt("-1"), 0x0n);
testMod(BigInt("-4660"), BigInt("-2"), 0x0n);
testMod(BigInt("-4660"), BigInt("-3"), BigInt("-1"));
testMod(BigInt("-4660"), BigInt("-4660"), 0x0n);
testMod(BigInt("-4660"), BigInt("-4275878551"), BigInt("-4660"));
testMod(BigInt("-4660"), BigInt("-4275878552"), BigInt("-4660"));
testMod(BigInt("-4660"), BigInt("-18364758544493064719"), BigInt("-4660"));
testMod(BigInt("-4660"), BigInt("-18364758544493064720"), BigInt("-4660"));
testMod(BigInt("-4275878551"), 0xFEDCBA9876543210n, BigInt("-4275878551"));
testMod(BigInt("-4275878551"), 0xFEDCBA987654320Fn, BigInt("-4275878551"));
testMod(BigInt("-4275878551"), 0xFEDCBA98n, BigInt("-4275878551"));
testMod(BigInt("-4275878551"), 0xFEDCBA97n, 0x0n);
testMod(BigInt("-4275878551"), 0x1234n, BigInt("-2351"));
testMod(BigInt("-4275878551"), 0x3n, BigInt("-1"));
testMod(BigInt("-4275878551"), 0x2n, BigInt("-1"));
testMod(BigInt("-4275878551"), 0x1n, 0x0n);
testMod(BigInt("-4275878551"), BigInt("-1"), 0x0n);
testMod(BigInt("-4275878551"), BigInt("-2"), BigInt("-1"));
testMod(BigInt("-4275878551"), BigInt("-3"), BigInt("-1"));
testMod(BigInt("-4275878551"), BigInt("-4660"), BigInt("-2351"));
testMod(BigInt("-4275878551"), BigInt("-4275878551"), 0x0n);
testMod(BigInt("-4275878551"), BigInt("-4275878552"), BigInt("-4275878551"));
testMod(BigInt("-4275878551"), BigInt("-18364758544493064719"), BigInt("-4275878551"));
testMod(BigInt("-4275878551"), BigInt("-18364758544493064720"), BigInt("-4275878551"));
testMod(BigInt("-4275878552"), 0xFEDCBA9876543210n, BigInt("-4275878552"));
testMod(BigInt("-4275878552"), 0xFEDCBA987654320Fn, BigInt("-4275878552"));
testMod(BigInt("-4275878552"), 0xFEDCBA98n, 0x0n);
testMod(BigInt("-4275878552"), 0xFEDCBA97n, BigInt("-1"));
testMod(BigInt("-4275878552"), 0x1234n, BigInt("-2352"));
testMod(BigInt("-4275878552"), 0x3n, BigInt("-2"));
testMod(BigInt("-4275878552"), 0x2n, 0x0n);
testMod(BigInt("-4275878552"), 0x1n, 0x0n);
testMod(BigInt("-4275878552"), BigInt("-1"), 0x0n);
testMod(BigInt("-4275878552"), BigInt("-2"), 0x0n);
testMod(BigInt("-4275878552"), BigInt("-3"), BigInt("-2"));
testMod(BigInt("-4275878552"), BigInt("-4660"), BigInt("-2352"));
testMod(BigInt("-4275878552"), BigInt("-4275878551"), BigInt("-1"));
testMod(BigInt("-4275878552"), BigInt("-4275878552"), 0x0n);
testMod(BigInt("-4275878552"), BigInt("-18364758544493064719"), BigInt("-4275878552"));
testMod(BigInt("-4275878552"), BigInt("-18364758544493064720"), BigInt("-4275878552"));
testMod(BigInt("-18364758544493064719"), 0xFEDCBA9876543210n, BigInt("-18364758544493064719"));
testMod(BigInt("-18364758544493064719"), 0xFEDCBA987654320Fn, 0x0n);
testMod(BigInt("-18364758544493064719"), 0xFEDCBA97n, BigInt("-2004318072"));
testMod(BigInt("-18364758544493064719"), 0x1234n, BigInt("-2399"));
testMod(BigInt("-18364758544493064719"), 0x3n, BigInt("-2"));
testMod(BigInt("-18364758544493064719"), 0x2n, BigInt("-1"));
testMod(BigInt("-18364758544493064719"), 0x1n, 0x0n);
testMod(BigInt("-18364758544493064719"), BigInt("-1"), 0x0n);
testMod(BigInt("-18364758544493064719"), BigInt("-2"), BigInt("-1"));
testMod(BigInt("-18364758544493064719"), BigInt("-3"), BigInt("-2"));
testMod(BigInt("-18364758544493064719"), BigInt("-4660"), BigInt("-2399"));
testMod(BigInt("-18364758544493064719"), BigInt("-4275878551"), BigInt("-2004318072"));
testMod(BigInt("-18364758544493064719"), BigInt("-4275878552"), BigInt("-1985229327"));
testMod(BigInt("-18364758544493064719"), BigInt("-18364758544493064719"), 0x0n);
testMod(BigInt("-18364758544493064719"), BigInt("-18364758544493064720"), BigInt("-18364758544493064719"));
testMod(BigInt("-18364758544493064720"), 0xFEDCBA9876543210n, 0x0n);
testMod(BigInt("-18364758544493064720"), 0xFEDCBA987654320Fn, BigInt("-1"));
testMod(BigInt("-18364758544493064720"), 0xFEDCBA98n, BigInt("-1985229328"));
testMod(BigInt("-18364758544493064720"), 0xFEDCBA97n, BigInt("-2004318073"));
testMod(BigInt("-18364758544493064720"), 0x1234n, BigInt("-2400"));
testMod(BigInt("-18364758544493064720"), 0x3n, 0x0n);
testMod(BigInt("-18364758544493064720"), 0x2n, 0x0n);
testMod(BigInt("-18364758544493064720"), 0x1n, 0x0n);
testMod(BigInt("-18364758544493064720"), BigInt("-1"), 0x0n);
testMod(BigInt("-18364758544493064720"), BigInt("-2"), 0x0n);
testMod(BigInt("-18364758544493064720"), BigInt("-3"), 0x0n);
testMod(BigInt("-18364758544493064720"), BigInt("-4660"), BigInt("-2400"));
testMod(BigInt("-18364758544493064720"), BigInt("-4275878551"), BigInt("-2004318073"));
testMod(BigInt("-18364758544493064720"), BigInt("-4275878552"), BigInt("-1985229328"));
testMod(BigInt("-18364758544493064720"), BigInt("-18364758544493064719"), BigInt("-1"));
testMod(BigInt("-18364758544493064720"), BigInt("-18364758544493064720"), 0x0n);

// Test rightTrim when result is zero, but m_length and m_sign are not canonical
testMod(340282366920938463463374607431768211456n, 340282366920938463463374607431768211456n, 0n);
testMod(BigInt("-340282366920938463463374607431768211456"), 340282366920938463463374607431768211456n, 0n);
testMod(340282366920938463463374607431768211456n, BigInt("-340282366920938463463374607431768211456"), 0n);

