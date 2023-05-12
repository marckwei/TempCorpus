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
noInline(shouldBe);

var isUndefinedOrNull = $vm.createBuiltin(`(function (value) { return @isUndefinedOrNull(value); })`);
noInline(isUndefinedOrNull);

var masquerader = makeMasquerader();
for (var i = 0; i < 1e5; ++i) {
    shouldBe(isUndefinedOrNull(null), true);
    shouldBe(isUndefinedOrNull(undefined), true);
    shouldBe(isUndefinedOrNull("Hello"), false);
    shouldBe(isUndefinedOrNull(Symbol("Hello")), false);
    shouldBe(isUndefinedOrNull(42), false);
    shouldBe(isUndefinedOrNull(-42), false);
    shouldBe(isUndefinedOrNull(0), false);
    shouldBe(isUndefinedOrNull(-0), false);
    shouldBe(isUndefinedOrNull(42.2), false);
    shouldBe(isUndefinedOrNull(-42.2), false);
    shouldBe(isUndefinedOrNull({}), false);
    shouldBe(isUndefinedOrNull([]), false);
    shouldBe(isUndefinedOrNull(true), false);
    shouldBe(isUndefinedOrNull(masquerader), false);
}
