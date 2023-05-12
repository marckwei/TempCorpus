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


function testValue(value, expected) {
    if (value !== expected)
        throw new Error("bad value: expected:(" + expected + "),actual:(" + value +").");
}

var set = new Set([0]);
var counter = 0;
for (var elm of set) {
    testValue(elm, counter);
    set.add(elm + 1);
    if (elm > 10000) {
        set.clear();
    }
    ++counter;
}
testValue(counter, 10002);

var set = new Set([0, 1, 2, 3]);
var counter = 0;
for (var elm of set) {
    testValue(elm, counter);
    set.clear();
    ++counter;
}
testValue(counter, 1);

var set = new Set([0, 1, 2, 3]);
var exp = [0, 2, 3];
var counter = 0;
for (var elm of set) {
    testValue(elm, exp[counter]);
    set.delete(counter + 1);
    ++counter;
}
testValue(counter, 3);

var set = new Set([0, 1, 2, 3]);
var iter = set[Symbol.iterator]();
var iter2 = set[Symbol.iterator]();
testValue(iter2.next().value, 0);

// Consume all output of iter.
for (var elm of iter);

testValue(iter.next().done, true);
testValue(iter.next().value, undefined);

set.clear();
set.add(1).add(2).add(3);

testValue(iter.next().done, true);
testValue(iter.next().value, undefined);
testValue(iter2.next().value, 1);
testValue(iter2.next().value, 2);
testValue(iter2.next().value, 3);

var set = new Set();
set.add(1);
set.delete(1);
set.forEach(function (i) {
    throw new Error("unreeachable.");
});

var set = new Set();
var iter = set[Symbol.iterator]();
set.add(1);
set.delete(1);
for (var elm of iter) {
    throw new Error("unreeachable.");
}

var set = new Set([0, 1, 2, 3, 4]);
var iter = set[Symbol.iterator]();
testValue(set.size, 5);
testValue(iter.next().value, 0);
testValue(iter.next().value, 1);
testValue(iter.next().value, 2);
testValue(iter.next().value, 3);
set.delete(0);
set.delete(1);
set.delete(2);
set.delete(3);
// It will cause MapData packing.
for (var i = 5; i < 1000; ++i)
    set.add(i);
gc();
for (var i = 4; i < 1000; ++i)
    testValue(iter.next().value, i);
testValue(iter.next().value, undefined);

