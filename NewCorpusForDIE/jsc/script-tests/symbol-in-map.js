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

description(
"This tests Symbols work in ES6 Map."
);

var symbol = Symbol("Cocoa");
var symbol2 = Symbol("Matcha");
var map = new Map();

map.set(symbol, "Cappuccino");
shouldBe("map.size", "1");
shouldBeEqualToString("map.get(symbol)", "Cappuccino");
shouldBeFalse("map.has(Symbol('Cocoa'))");
shouldBe("map.get(Symbol('Cocoa'))", "undefined");
shouldBeFalse("map.has('Cocoa')");
shouldBe("map.get('Cocoa')", "undefined");
shouldBeFalse("map.has(symbol2)");
shouldBe("map.get(symbol2)", "undefined");

map.set(symbol2, "Kilimanjaro");
shouldBe("map.size", "2");
shouldBeEqualToString("map.get(symbol)", "Cappuccino");
shouldBeEqualToString("map.get(symbol2)", "Kilimanjaro");
shouldBeFalse("map.has(Symbol('Matcha'))");
shouldBe("map.get(Symbol('Matcha'))", "undefined");
shouldBeFalse("map.has('Matcha')");
shouldBe("map.get('Matcha')", "undefined");

map.delete(symbol2);
shouldBeFalse("map.has(symbol2)");
shouldBe("map.get(symbol2)", "undefined");
shouldBeTrue("map.has(symbol)");
shouldBeEqualToString("map.get(symbol)", "Cappuccino");

shouldBe("map.size", "1");
var key, value;
map.forEach(function (v, k) {
    key = k;
    value = v;
});
shouldBe("key", "symbol");
shouldBeEqualToString("value", "Cappuccino");

successfullyParsed = true;
