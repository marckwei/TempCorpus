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

var a, b, c, d;

function testIf(x) {
    if (x > 10 && x < 20) {
        return a;
    } else if (x > 20 && x < 30) {
        return b;
    } else if (x > 30 && x < 40) {
        return c;
    } else {
        return d;
    }

    return null;
}

function noMatches(x) {
    if (x > 10 && x < 20) {
        return a;
    } else if (x > 20 && x < 30) {
        return b;
    } else {
        return c;
    }
}

assert(!hasBasicBlockExecuted(testIf, "return a"), "should not have executed yet.");
assert(!hasBasicBlockExecuted(testIf, "return b"), "should not have executed yet.");
assert(!hasBasicBlockExecuted(testIf, "return c"), "should not have executed yet.");
assert(!hasBasicBlockExecuted(testIf, "return d"), "should not have executed yet.");

testIf(11);
assert(hasBasicBlockExecuted(testIf, "return a"), "should have executed.");
assert(hasBasicBlockExecuted(testIf, "x > 10"), "should have executed.");
assert(!hasBasicBlockExecuted(testIf, "return b"), "should not have executed yet.");

testIf(21);
assert(hasBasicBlockExecuted(testIf, "return b"), "should have executed.");
assert(!hasBasicBlockExecuted(testIf, "return c"), "should not have executed yet.");

testIf(31);
assert(hasBasicBlockExecuted(testIf, "return c"), "should have executed.");
assert(!hasBasicBlockExecuted(testIf, "return d"), "should not have executed yet.");

testIf(0);
assert(hasBasicBlockExecuted(testIf, "return d"), "should have executed.");


noMatches(0);
assert(!hasBasicBlockExecuted(noMatches, "return a"), "should not have executed yet.");
assert(hasBasicBlockExecuted(noMatches, "x > 10"), "should have executed.");
assert(!hasBasicBlockExecuted(noMatches, "return b"), "should not have executed yet.");
assert(hasBasicBlockExecuted(noMatches, "x > 20"), "should have executed.");
assert(hasBasicBlockExecuted(noMatches, "return c"), "should have executed.");
