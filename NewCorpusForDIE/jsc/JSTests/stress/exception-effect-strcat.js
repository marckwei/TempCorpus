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

function foo(a, b) {
    return a + b;
}

noInline(foo);

var bStr = "b";
for (var i = 0; i < 30; ++i)
    bStr = bStr + bStr;

var effects = 0;
var b = {toString: function() { effects++; return bStr; }};

for (var i = 0; i < 10000; ++i) {
    effects = 0;
    var result = foo("a", b);
    if (result.length != "a".length + bStr.length)
        throw "Error: bad result in loop: " + result;
    if (effects != 1)
        throw "Error: bad number of effects: " + effects;
}

// Create a large string.
var a = "a";
for (var i = 0; i < 30; ++i)
    a = a + a;

effects = 0;
var result = null;
var didThrow = false;
try {
    result = foo(a, b);
} catch (e) {
    didThrow = true;
}

if (!didThrow)
    throw "Error: did not throw.";
if (result !== null)
    throw "Error: did set result to something: " + result;
if (effects != 1)
    throw "Error: bad number of effects at end: " + effects;
