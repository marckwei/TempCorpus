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

//@ runDefault("--thresholdForGlobalLexicalBindingEpoch=2")

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}
noInline(shouldBe);

foo1 = 1;
foo2 = 2;
function get1() {
    return foo1;
}
noInline(get1);

function get2() {
    return foo2;
}
noInline(get2);

function get1If(condition) {
    if (condition)
        return foo1;
    return -1;
}
noInline(get1If);

function get2If(condition) {
    if (condition)
        return foo2;
    return -1;
}
noInline(get2If);

for (var i = 0; i < 1e5; ++i) {
    shouldBe(get1(), 1);
    shouldBe(get2(), 2);
    shouldBe(get1(), 1);
    shouldBe(get2(), 2);
    shouldBe(get1If(true), 1);
    shouldBe(get2If(true), 2);
    shouldBe(get1If(false), -1);
    shouldBe(get2If(false), -1);
}

$.evalScript(`const foo1 = 41;`);
$.evalScript(`const foo2 = 42;`);

for (var i = 0; i < 1e3; ++i) {
    shouldBe(get1(), 41);
    shouldBe(get2(), 42);
    shouldBe(get1(), 41);
    shouldBe(get2(), 42);
    shouldBe(get1If(false), -1);
    shouldBe(get2If(false), -1);
}
shouldBe(get1If(true), 41);
shouldBe(get2If(true), 42);
