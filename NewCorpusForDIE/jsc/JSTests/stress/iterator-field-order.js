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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

var array = [ 42 ];

shouldBe(JSON.stringify(array.values().next()), `{"value":42,"done":false}`);
shouldBe(JSON.stringify(array.keys().next()), `{"value":0,"done":false}`);
shouldBe(JSON.stringify(array.entries().next()), `{"value":[0,42],"done":false}`);

async function* asyncIterator() {
    yield 42;
}

var iterator = asyncIterator();
iterator.next().then(function (value) {
    shouldBe(JSON.stringify(value), `{"value":42,"done":false}`);
}).catch($vm.abort);

function* generator() {
    yield 42;
}

shouldBe(JSON.stringify(generator().next()), `{"value":42,"done":false}`);

var map = new Map([[0,42]]);
shouldBe(JSON.stringify(map.keys().next()), `{"value":0,"done":false}`);
shouldBe(JSON.stringify(map.values().next()), `{"value":42,"done":false}`);
shouldBe(JSON.stringify(map.entries().next()), `{"value":[0,42],"done":false}`);

var set = new Set([42]);
shouldBe(JSON.stringify(set.keys().next()), `{"value":42,"done":false}`);
shouldBe(JSON.stringify(set.values().next()), `{"value":42,"done":false}`);
shouldBe(JSON.stringify(set.entries().next()), `{"value":[42,42],"done":false}`);

var string = "Cocoa";
shouldBe(JSON.stringify(string[Symbol.iterator]().next()), `{"value":"C","done":false}`);
