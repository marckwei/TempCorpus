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

function assert(successCondition) {
    if (!successCondition) {
        $vm.print("FAILED at:");
        $vm.dumpStack();
        throw "FAIL";
    }
}

function testNonStrict() {
    let foo = function () { }
    let bar = function () { }
    let arrow = () => { }
    let arrow2 = () => { }
    let native = $vm.dataLog;
    let native2 = $vm.print;

    // This test relies on invoking hasOwnProperty on a builtin first before invoking
    // it on a regular function. So, the following order is important here.
    assert(isNaN.hasOwnProperty("prototype") == false);
    assert(foo.hasOwnProperty("prototype") == true);
    assert(arrow.hasOwnProperty("prototype") == false);
    assert(native.hasOwnProperty("prototype") == false);

    assert(isFinite.hasOwnProperty("prototype") == false);
    assert(bar.hasOwnProperty("prototype") == true);
    assert(arrow2.hasOwnProperty("prototype") == false);
    assert(native2.hasOwnProperty("prototype") == false);

    // Repeat to exercise HasOwnPropertyCache.
    assert(isNaN.hasOwnProperty("prototype") == false);
    assert(foo.hasOwnProperty("prototype") == true);
    assert(arrow.hasOwnProperty("prototype") == false);
    assert(native.hasOwnProperty("prototype") == false);

    assert(isFinite.hasOwnProperty("prototype") == false);
    assert(bar.hasOwnProperty("prototype") == true);
    assert(arrow2.hasOwnProperty("prototype") == false);
    assert(native2.hasOwnProperty("prototype") == false);
}
noInline(testNonStrict);

function testStrict() {
    "use strict";

    let foo = function () { }
    let bar = function () { }
    let arrow = () => { }
    let arrow2 = () => { }
    let native = $vm.dataLog;
    let native2 = $vm.print;

    // This test relies on invoking hasOwnProperty on a builtin first before invoking
    // it on a regular function. So, the following order is important here.
    assert(isNaN.hasOwnProperty("prototype") == false);
    assert(foo.hasOwnProperty("prototype") == true);
    assert(arrow.hasOwnProperty("prototype") == false);
    assert(native.hasOwnProperty("prototype") == false);

    assert(isFinite.hasOwnProperty("prototype") == false);
    assert(bar.hasOwnProperty("prototype") == true);
    assert(arrow2.hasOwnProperty("prototype") == false);
    assert(native2.hasOwnProperty("prototype") == false);

    // Repeat to exercise HasOwnPropertyCache.
    assert(isNaN.hasOwnProperty("prototype") == false);
    assert(foo.hasOwnProperty("prototype") == true);
    assert(arrow.hasOwnProperty("prototype") == false);
    assert(native.hasOwnProperty("prototype") == false);

    assert(isFinite.hasOwnProperty("prototype") == false);
    assert(bar.hasOwnProperty("prototype") == true);
    assert(arrow2.hasOwnProperty("prototype") == false);
    assert(native2.hasOwnProperty("prototype") == false);
}
noInline(testStrict);

for (var i = 0; i < 10000; ++i) {
    testNonStrict();
    testStrict();
}
