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

// Copyright 2019 the V8 project authors. All rights reserved.
// Copyright 2020-2021 Apple Inc. All rights reserved.
// Use of this source code is governed by a BSD-style license.

function shouldBe(actual, expected) {
    // Tolerate different space characters used by different ICU versions.
    // Older ICU uses U+2009 Thin Space in ranges, whereas newer ICU uses
    // regular old U+0020. Let's ignore these differences.
    if (typeof actual === 'string')
        actual = actual.replaceAll(' ', ' ');

    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

if ($vm.icuHeaderVersion() >= 67) {
    let df = new Intl.DateTimeFormat("en");
    // A modern date
    let d1 = new Date(2019, 3, 4);
    let d2 = new Date(2019, 4, 5);
    shouldBe(df.format(d1), df.formatRange(d1, d1));
    shouldBe(df.format(d2), df.formatRange(d2, d2));
    shouldBe(df.formatRange(d1, d2), "4/4/2019 – 5/5/2019");
    // An old date just before the Julian / Gregorian switch
    let d3 = new Date(1582, 8, 13);
    let d4 = new Date(1582, 9, 14);
    shouldBe(df.format(d3), df.formatRange(d3, d3));
    shouldBe(df.format(d4), df.formatRange(d4, d4));
    shouldBe(df.formatRange(d3, d4), "9/13/1582 – 10/14/1582");
    // An older date
    let d5 = new Date(1000, 0, 1);
    let d6 = new Date(1001, 1, 2);
    shouldBe(df.format(d5), df.formatRange(d5, d5));
    shouldBe(df.format(d6), df.formatRange(d6, d6));
    shouldBe(df.formatRange(d5, d6), "1/1/1000 – 2/2/1001");
}
