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
"This tests an early experimental implementation of ES6-esque Symbols."
);

function forIn(o)
{
    var a = [];
    for (x in o)
        a.push(x);
    return a;
}

var prop = Symbol("prop");
var o = {};

shouldBeFalse("prop in o");
shouldBeFalse("'prop' in o");
shouldBe("Object.getOwnPropertyNames(o).length", '0');
shouldBe("forIn(o)", '[]');

o[prop] = 42;

shouldBeTrue("prop in o");
shouldBeFalse("'prop' in o");
shouldBe("Object.getOwnPropertyNames(o).length", '0');
shouldBe("forIn(o)", '[]');

o['prop'] = 101;

shouldBe("o[prop]", '42');
shouldBe("o['prop']", '101');
shouldBe("Object.getOwnPropertyNames(o).length", '1');
shouldBe("forIn(o)", '["prop"]');

delete o[prop];

shouldBeFalse("prop in o");
shouldBeTrue("'prop' in o");
shouldBe("Object.getOwnPropertyNames(o).length", '1');
shouldBe("forIn(o)", '["prop"]');

successfullyParsed = true;
