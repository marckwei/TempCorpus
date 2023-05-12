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

// This test checks the shape of builtin iterators.

function iteratorShape(iter) {
    if (iter.hasOwnProperty('next'))
        throw "Error: iterator should not have next method.";
    if (!iter.__proto__.hasOwnProperty('next'))
        throw "Error: iterator prototype should have next method.";
    if (typeof iter.__proto__.next !== "function")
        throw "Error: iterator prototype should have next method.";
}

function sameNextMethods(iterators) {
    var iterator = iterators[0];
    for (var i = 1; i < iterators.length; ++i) {
        if (iterator.next !== iterators[i].next)
            throw "Error: next method is not the same.";
    }
}

var array = ['Cocoa', 'Cappuccino', 'The des Alizes', 'Matcha', 'Kilimanjaro'];
var iterator = array[Symbol.iterator]();
iteratorShape(iterator);

var keyIterator = array.keys();
iteratorShape(keyIterator);

var keyValueIterator = array.entries();
iteratorShape(keyValueIterator);

sameNextMethods([array[Symbol.iterator](), array.keys(), array.entries()]);

var set = new Set(['Cocoa', 'Cappuccino', 'The des Alizes', 'Matcha', 'Kilimanjaro']);
var iterator = set[Symbol.iterator]();
iteratorShape(iterator);

var keyIterator = set.keys();
iteratorShape(keyIterator);

var keyValueIterator = set.entries();
iteratorShape(keyValueIterator);

sameNextMethods([set[Symbol.iterator](), set.keys(), set.entries()]);

var map = new Map();
[
    [ 'Cocoa', 2, ],
    [ 'Cappuccino', 0 ],
    [ 'The des Alizes', 3 ],
    [ 'Matcha', 2 ],
    [ 'Kilimanjaro', 1]
].forEach(function ([ key, value ]) {
    map.set(key, value);
});
var iterator = map[Symbol.iterator]();
iteratorShape(iterator);

var keyIterator = map.keys();
iteratorShape(keyIterator);

var keyValueIterator = map.entries();
iteratorShape(keyValueIterator);

sameNextMethods([map[Symbol.iterator](), map.keys(), map.entries()]);
