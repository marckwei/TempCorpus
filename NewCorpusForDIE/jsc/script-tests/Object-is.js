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

description("Test to ensure correct behavior of Object.is");

shouldBe("Object.is.length", "2");
shouldBe("Object.is.name", "'is'");
shouldBe("Object.is(NaN, NaN)", "true");
shouldBe("Object.is(null, null)", "true");
shouldBe("Object.is(null)", "false");
shouldBe("Object.is(undefined, undefined)", "true");
shouldBe("Object.is(true, true)", "true");
shouldBe("Object.is(false, false)", "true");
shouldBe("Object.is('abc', 'abc')", "true");
shouldBe("Object.is(Infinity, Infinity)", "true");
shouldBe("Object.is(0, 0)", "true");
shouldBe("Object.is(-0, -0)", "true");
shouldBe("Object.is(0, -0)", "false");
shouldBe("Object.is(-0, 0)", "false");
shouldBe("var obj = {}; Object.is(obj, obj)", "true");
shouldBe("var arr = []; Object.is(arr, arr)", "true");
shouldBe("var sym = Symbol(); Object.is(sym, sym)", "true");
