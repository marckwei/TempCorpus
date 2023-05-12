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

function opaqueModuloSmaller(a)
{
    return (a % 5) % 13;
}
noInline(opaqueModuloSmaller);

function opaqueModuloEqual(a)
{
    return (a % 5) % 5;
}
noInline(opaqueModuloEqual);

function opaqueModuloLarger(a)
{
    return (a % 13) % 5;
}
noInline(opaqueModuloLarger);

function opaqueModuloSmallerNeg(a)
{
    return (a % -5) % -13;
}
noInline(opaqueModuloSmallerNeg);

function opaqueModuloEqualNeg(a)
{
    return (a % 5) % -5;
}
noInline(opaqueModuloEqualNeg);

function opaqueModuloLargerNeg(a)
{
    return (a % -13) % 5;
}
noInline(opaqueModuloLargerNeg);

let testReducibleCases = [opaqueModuloSmaller, opaqueModuloEqual, opaqueModuloSmallerNeg, opaqueModuloEqualNeg];
let testOtherCases = [opaqueModuloLarger, opaqueModuloLargerNeg];

function opaqueExpectedOther(doubleInput)
{
    return (doubleInput - 2147483648) % 13.0 % 5.0;
}
noInline(opaqueExpectedOther);
noDFG(opaqueExpectedOther);

// Warm up with integers. The test for NegZero should not be eliminated here.
for (let i = 1; i < 1e4; ++i) {
    let excpectedReduced = i % 5;
    for (let testFunction of testReducibleCases) {
        let result = testFunction(i);
        if (result !== excpectedReduced)
            throw "" + testFunction.name + "(i), returned: " + result + " at i = " + i + " expected " + expectedOther;
    }
    let expectedOther = opaqueExpectedOther(i + 2147483648);
    for (let testFunction of testOtherCases) {
        let result = testFunction(i);
        if (result !== expectedOther)
            throw "" + testFunction.name + "(i), returned: " + result + " at i = " + i + " expected " + expectedOther;
    }
}