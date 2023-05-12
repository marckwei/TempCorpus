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
"This tests that DFG generated code speculating SlowPutArrayStorageShape doesn't crash when seeing fast ArrayStorageShapes."
);

var slowPutArrayStorageArray = [ "slow" ];
var fastArrayStorageArray = [ "fast" ];
fastArrayStorageArray[1000] = 50;

var o = { a: 10 };
Object.defineProperties(o, {
    "0": {
        set: function(x) { this.a = x; },
    },
});    

slowPutArrayStorageArray.__proto__ = o;

function foo(a, isFast) {
    var result = 10;
    if (!a)
        return result;

    var doStuff = a[0] && isFast;
    if (doStuff)
        result = a[0] + 10;
    return result;
}

function test() {
    for (var k = 0; k < 5000; k++) {
        foo(slowPutArrayStorageArray, false);
        foo(fastArrayStorageArray, true);
    }
}

test();

var successfullyParsed = true;
