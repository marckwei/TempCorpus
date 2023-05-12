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

var hasBasicBlockExecuted = $vm.hasBasicBlockExecuted;

load("./driver/driver.js");

var a, b, c;
function testSwitch(s) {
    switch (s) {
    case "foo":
        return a;
    case "bar":
        return b;
    default:
        return c;
    }
}

assert(!hasBasicBlockExecuted(testSwitch, "switch"), "should not have executed yet.");

testSwitch("foo");
assert(hasBasicBlockExecuted(testSwitch, "switch"), "should have executed.");
assert(hasBasicBlockExecuted(testSwitch, "return a"), "should have executed.");
assert(!hasBasicBlockExecuted(testSwitch, "return b"), "should not have executed yet.");
assert(!hasBasicBlockExecuted(testSwitch, "return c"), "should not have executed yet.");

testSwitch("bar");
assert(hasBasicBlockExecuted(testSwitch, "return b"), "should have executed.");
assert(!hasBasicBlockExecuted(testSwitch, "return c"), "should not have executed yet.");

testSwitch("");
assert(hasBasicBlockExecuted(testSwitch, "return c"), "should have executed.");
