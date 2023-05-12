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

description("Verify that JSON.stringify passes keys as strings when calling toJSON or the replacer function.");

debug("Test Replacer Function");
var globalKey;
var globalValue;
var globalIndex = 0;
function replacer(key, value) {
    globalKey = key;
    globalValue = value;
    if (globalIndex == 0) {
        shouldBeEqualToString("typeof globalKey", "string");
        shouldBeEqualToString("globalKey", "");
        shouldBeEqualToString("typeof globalValue", "object");
        shouldBeTrue("globalValue instanceof Array");
        shouldBe("globalValue.length", "1");
        shouldBe("globalValue[0]", "42");
    } else if (globalIndex == 1) {
        globalKey = key;
        shouldBeEqualToString("typeof globalKey", "string");
        shouldBeEqualToString("globalKey", "0");
        shouldBeEqualToString("typeof globalValue", "number");
        shouldBe("globalValue", "42");
        value = 5;
    } else {
        shouldBeTrue(false);
    }
    ++globalIndex;
    return value;
}

shouldBeEqualToString("JSON.stringify([42], replacer)", "[5]");

debug("");
debug("Test toJSON Function");
var globalThis;
var toJSONArrayHelperCallCounter = 0;
var testObject = {
    toJSON: function(key) {
        globalThis = this;
        globalKey = key;
        shouldBe("toJSONArrayHelperCallCounter", "1");
        shouldBeTrue("globalThis === testObject");
        shouldBeEqualToString("typeof globalKey", "string");
        shouldBeEqualToString("globalKey", "0");
        return true;
    }
}

var testArray = [testObject];
function toJSONArrayHelper(key) {
    globalThis = this;
    globalKey = key;
    shouldBe("toJSONArrayHelperCallCounter", "0");
    shouldBeTrue("globalThis === testArray");
    shouldBeEqualToString("typeof globalKey", "string");
    shouldBeEqualToString("globalKey", "");
    ++toJSONArrayHelperCallCounter;
    return this;
}

Array.prototype.toJSON = toJSONArrayHelper;
shouldBeEqualToString("JSON.stringify(testArray)", "[true]");
