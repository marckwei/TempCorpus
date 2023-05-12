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
"This tests that Math.min and Math.max for doubles works correctly in the DFG JIT."
);

function doMin(a, b) {
    return Math.min(a, b);
}

function doMax(a, b) {
    return Math.max(a, b);
}

testRunner.neverInlineFunction(doMin);
testRunner.neverInlineFunction(doMax);

var count = 0;
while (!testRunner.numberOfDFGCompiles(doMin) || !testRunner.numberOfDFGCompiles(doMax)) {
    doMin(1.5, 2.5);
    doMax(1.5, 2.5);
    count++;
}

shouldBe("doMin(1.5, 2.5)", "1.5");
shouldBe("doMin(2.5, 1.5)", "1.5");
shouldBe("doMin(1.5, 1.5)", "1.5");
shouldBe("doMin(2.5, 2.5)", "2.5");

shouldBe("doMin(1.5, NaN)", "NaN");
shouldBe("doMin(2.5, NaN)", "NaN");
shouldBe("doMin(NaN, 1.5)", "NaN");
shouldBe("doMin(NaN, 2.5)", "NaN");

shouldBe("doMin(NaN, NaN)", "NaN");

shouldBe("doMax(1.5, 2.5)", "2.5");
shouldBe("doMax(2.5, 1.5)", "2.5");
shouldBe("doMax(1.5, 1.5)", "1.5");
shouldBe("doMax(2.5, 2.5)", "2.5");

shouldBe("doMax(1.5, NaN)", "NaN");
shouldBe("doMax(2.5, NaN)", "NaN");
shouldBe("doMax(NaN, 1.5)", "NaN");
shouldBe("doMax(NaN, 2.5)", "NaN");

shouldBe("doMax(NaN, NaN)", "NaN");

var successfullyParsed = true;
