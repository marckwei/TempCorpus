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

// Original test case.
function isNaNOnDouble(value)
{
    return (+value) !== value;
}
noInline(isNaNOnDouble);

function testIsNaNOnDoubles()
{
    var value = isNaNOnDouble(-0);
    if (value)
        throw "isNaNOnDouble(-0) = " + value;

    var value = isNaNOnDouble(NaN);
    if (!value)
        throw "isNaNOnDouble(NaN) = " + value;

    var value = isNaNOnDouble(Number.POSITIVE_INFINITY);
    if (value)
        throw "isNaNOnDouble(Number.POSITIVE_INFINITY) = " + value;
}
noInline(testIsNaNOnDoubles);

for (let i = 0; i < 1e6; ++i) {
    testIsNaNOnDoubles();
}

// Simplified test case.
function isNaNOnDouble2(value)
{
    let valueToNumber = (+value);
    return valueToNumber !== valueToNumber;
}
noInline(isNaNOnDouble2);

// Warm up without NaN.
for (let i = 0; i < 1e6; ++i) {
    if (isNaNOnDouble2(1.5))
        throw "Failed isNaNOnDouble(1.5)";
}

// Then pass some NaNs.
for (let i = 0; i < 1e6; ++i) {
    if (!isNaNOnDouble2(NaN))
        throw "Failed isNaNOnDouble(NaN)";
}
