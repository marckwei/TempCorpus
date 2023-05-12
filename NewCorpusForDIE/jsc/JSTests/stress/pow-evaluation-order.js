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

// Copyright (C) 2016 Rick Waldron. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

function shouldBe(actual, expected)
{
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

{
    let capture = [];
    let leftValue = { valueOf() { capture.push("leftValue"); return 3; }};
    let rightValue = { valueOf() { capture.push("rightValue"); return 2; }};

    (capture.push("left"), leftValue) ** +(capture.push("right"), rightValue);
//                                       ^
//                                Changes the order

    // Expected per operator evaluation order: "left", "right", "rightValue", "leftValue"
    shouldBe(capture[0], "left");
    shouldBe(capture[1], "right");
    shouldBe(capture[2], "rightValue");
    shouldBe(capture[3], "leftValue");
}

{
    let capture = [];
    let leftValue = { valueOf() { capture.push("leftValue"); return 3; }};
    let rightValue = { valueOf() { capture.push("rightValue"); return 2; }};

    (+(capture.push("left"), leftValue)) ** (capture.push("right"), rightValue);
//   ^
//   Changes the order

    // Expected per operator evaluation order: "left", "right", "rightValue", "leftValue"
    shouldBe(capture[0], "left");
    shouldBe(capture[1], "leftValue");
    shouldBe(capture[2], "right");
    shouldBe(capture[3], "rightValue");
}
