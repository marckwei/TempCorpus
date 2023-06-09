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

//@ skip if $architecture == "x86"

var someGlobal;

// This is a simple speed test. It should go fast.

function foo() {
    var myObject = {};
    for (var i = 0; i < 10000000; ++i) {
        someGlobal = myObject.undefinedProperty;
    }
    return someGlobal;
}
result = foo();
if (result != undefined)
    throw new Error("Bad result: " + result);

// This test checks that a cached property lookup miss doesn't continue to fire when the property suddenly appears on the object.

function bar() {
    var myObject = {};
    for (var i = 0; i < 100000000; ++i) {
        someGlobal = myObject.someProperty;
        if (i == 50000000)
            myObject.someProperty = 1;
    }
    return someGlobal;
}
var result = bar();
if (result != 1)
    throw new Error("Bad result: " + result);
someGlobal = undefined;

// This test checks that a cached property lookup miss doesn't continue to fire when the property suddenly appears on the object's prototype.

function baz() {
    var myPrototype = {}
    var myObject = {};
    myObject.__proto__ = myPrototype;
    for (var i = 0; i < 100000000; ++i) {
        someGlobal = myObject.someProperty;
        if (i == 50000000)
            myPrototype.someProperty = 2;
    }
    return someGlobal;
}
var result = baz();
if (result != 2)
    throw new Error("Bad result: " + result);

