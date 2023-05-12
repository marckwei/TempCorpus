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

// REGRESSION(r183072): dfg-put-by-id-prototype-check.js.layout-dfg-eager-no-cjit fails on AArch64 Linux
// https://bugs.webkit.org/show_bug.cgi?id=144256
//@ skip if $architecture == "arm64" and $hostOS == "linux"

description(
"Test that a generic array (object) accepts DFG PutByValueDirect operation."
);

function foo1() {
    var computedProperty1 = 'hello';
    var computedProperty2 = 42;
    var object = {
        [computedProperty1]: 'world',
        [computedProperty2]: 'world2',
        he: 'a',
        30000: 42
    };
    return object.hello;
}

function foo2() {
    var computedProperty1 = 'hello';
    var computedProperty2 = 42;
    var object = {
        [computedProperty1]: 'world',
        [computedProperty2]: 'world2',
        he: 'a',
        30000: 42
    };
    return object[42];
}



dfgShouldBe(foo1, "foo1()", "'world'");
dfgShouldBe(foo2, "foo2()", "'world2'");
