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

function shouldBe(actual, expected)
{
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

var iteratorPrototype = "Cocoa"[Symbol.iterator]().__proto__.__proto__;

shouldBe(iteratorPrototype !== Object.prototype, true);
shouldBe(iteratorPrototype.__proto__, Object.prototype);
shouldBe(JSON.stringify(Object.getOwnPropertyNames(iteratorPrototype)), '[]');
shouldBe(Object.getOwnPropertySymbols(iteratorPrototype).length, 1);
shouldBe(Object.getOwnPropertySymbols(iteratorPrototype)[0], Symbol.iterator);
shouldBe(iteratorPrototype[Symbol.iterator](), iteratorPrototype);
var stringIterator = "Hello"[Symbol.iterator]();
shouldBe(iteratorPrototype[Symbol.iterator].call(stringIterator), stringIterator);

function inheritIteratorPrototype(iterator)
{
    var prototype = iterator.__proto__;
    shouldBe(prototype !== iteratorPrototype, true);
    shouldBe(Object.getOwnPropertyDescriptor(prototype, 'constructor'), undefined);
    shouldBe(prototype.__proto__, iteratorPrototype);
    shouldBe(iteratorPrototype[Symbol.iterator].name, '[Symbol.iterator]');
    shouldBe(iteratorPrototype.hasOwnProperty(Symbol.iterator), true);
}

inheritIteratorPrototype("Cappuccino"[Symbol.iterator]());
inheritIteratorPrototype(new Map()[Symbol.iterator]());
inheritIteratorPrototype(new Set()[Symbol.iterator]());
inheritIteratorPrototype(new Array()[Symbol.iterator]());
inheritIteratorPrototype((function (a, b, c) { return arguments; }(0, 1, 2))[Symbol.iterator]());
inheritIteratorPrototype((function (a, b, c) { 'use strict'; return arguments; }(0, 1, 2))[Symbol.iterator]());

function testChain(iterable)
{
    // Iterator instance
    var iterator = iterable[Symbol.iterator]();
    // %MapIteratorPrototype%
    var proto1 = Object.getPrototypeOf(iterator);
    // %IteratorPrototype%
    var proto2 = Object.getPrototypeOf(proto1);

    shouldBe(proto2.hasOwnProperty(Symbol.iterator), true);
    shouldBe(proto1.hasOwnProperty(Symbol.iterator), false);
    shouldBe(iterator.hasOwnProperty(Symbol.iterator), false);
    shouldBe(iterator[Symbol.iterator](), iterator);
}

testChain("Cocoa");
testChain(new Map());
testChain(new Set());
testChain(new Array());
