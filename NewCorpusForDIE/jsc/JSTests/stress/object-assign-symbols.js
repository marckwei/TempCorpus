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

var a = Symbol("a");
var b = Symbol("b");
var c = Symbol("c");
var d = Symbol("d");
var e = Symbol("e");

var obj = {
    [a]: 1,
    [b]: 2,
    [c]: 3,
    [d]: null,
    [e]: 'e'
};

function test(src) {
    var o = {};
    var keys = Object.getOwnPropertySymbols(src);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        o[key] = src[key];
    }
    return o;
}
noInline(test);

for (var i = 0; i < 1e4; ++i) {
    var result = test(obj);
    shouldBe(result[a], 1);
    shouldBe(result[b], 2);
    shouldBe(result[c], 3);
    shouldBe(result[d], null);
    shouldBe(result[e], 'e');
}
