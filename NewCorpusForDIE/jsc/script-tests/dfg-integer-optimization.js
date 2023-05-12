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
"This tests that integer addition optimizations in the DFG are not performed too overzealously."
);

function doAdd(a,b) {
    // The point of this test is to see if the DFG CSE's the second (a + b) against the first, after
    // optimizing the first to be an integer addition. The first one certainly is an integer addition,
    // but the second one isn't - it must either be an integer addition with overflow checking, or a
    // double addition.
    return {a:((a + b) | 0), b:(a + b)};
}

for (var i = 0; i < 1000; ++i) {
    // Create numbers big enough that we'll start seeing doubles only after about 200 invocations.
    var a = i * 1000 * 1000 * 10;
    var b = i * 1000 * 1000 * 10 + 1;
    var result = doAdd(a, b);
    
    // Use eval() for computing the correct result, to force execution to happen outside the DFG.
    shouldBe("result.a", "" + eval("((" + a + " + " + b + ") | 0)"))
    shouldBe("result.b", "" + eval(a + " + " + b))
}

