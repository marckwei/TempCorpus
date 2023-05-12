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
"This test checks corner cases of the number cell reuse code. In particular, it checks for known cases where code generation for number cell reuse caused assertions to fail."
);

function leftConstantRightSimple(a)
{
    return 0.1 * (a * a);
}

shouldBe("leftConstantRightSimple(2)", "0.4");

function leftConstantRightComplex(a)
{
    return 0.1 * (a * a + a);
}

shouldBe("leftConstantRightComplex(1)", "0.2");

function leftSimpleRightConstant(a)
{
    return (a * a) * 0.1;
}

shouldBe("leftSimpleRightConstant(2)", "0.4");

function leftComplexRightConstant(a)
{
    return (a * a + a) * 0.1;
}

shouldBe("leftComplexRightConstant(1)", "0.2");

function leftThisRightSimple(a)
{
    return this * (a * a);
}

shouldBeNaN("leftThisRightSimple(2)");
shouldBe("leftThisRightSimple.call(2, 2)", "8");

function leftThisRightComplex(a)
{
    return this * (a * a + a);
}

shouldBeNaN("leftThisRightComplex(2)");
shouldBe("leftThisRightComplex.call(2, 2)", "12");

function leftSimpleRightThis(a)
{
    return (a * a) * this;
}

shouldBeNaN("leftSimpleRightThis(2)");
shouldBe("leftSimpleRightThis.call(2, 2)", "8");

function leftComplexRightThis(a)
{
    return (a * a + a) * this;
}

shouldBeNaN("leftComplexRightThis(2)");
shouldBe("leftComplexRightThis.call(2, 2)", "12");
