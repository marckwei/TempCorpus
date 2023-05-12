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

// Inspired by mozilla tests
description('Tests for ES6 arrow function prototype property');

var af1 = () =>  {};

debug('() =>  {}');
shouldBe("typeof af1.prototype", "'undefined'");
shouldBe("af1.hasOwnProperty('prototype')", "false");

var af2 = (a) => {a + 1};

debug('(a) => {a + 1}');
shouldBe("typeof af2.prototype", "'undefined'");
shouldBe("af2.hasOwnProperty('prototype')", "false");

var af3 = (x) =>  x + 1;

debug('(x) =>  x + 1');
shouldBe("typeof af3.prototype", "'undefined'");
shouldBe("af3.hasOwnProperty('prototype')", "false");


af1.prototype = function (x) { return x + 1;};

debug('af1.prototype = function (x) { return x + 1;}');
shouldBe("typeof af1.prototype", "'function'");
shouldBe("af1.prototype.toString()", "'function (x) { return x + 1;}'");
shouldBe("af1.hasOwnProperty('prototype')", "true");

delete af1.prototype;

debug('delete af1.prototype');
shouldBe("typeof af1.prototype", "'undefined'");
shouldBe("af1.hasOwnProperty('prototype')", "false");

var successfullyParsed = true;
