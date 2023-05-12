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

var gi;

function foo() {
    if (!effectful42())
        arguments = "hello";
    return arguments[gi];
}

function bar(array, i) {
    gi = i;
    return foo.apply(this, array);
}

noInline(bar);

var bigArray = [];
for (var i = 0; i < 50; ++i)
    bigArray.push(42);

for (var i = 0; i < 10000; ++i) {
    var mi = i % 50;
    var result = bar(bigArray, mi);
    if (result !== 42)
        throw "Bad result in first loop: " + result + "; expected: " + 42;
}


for (var i = 0; i < 10000; ++i) {
    var mi = i % 100;
    var result = bar([42], mi);
    var expected = mi ? void 0 : 42;
    if (result !== expected)
        throw "Bad result in second loop: " + result + "; expected: " + expected;
}

