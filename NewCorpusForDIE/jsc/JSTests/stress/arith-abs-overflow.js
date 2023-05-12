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

function opaqueAbs(value)
{
    return Math.abs(value);
}
noInline(opaqueAbs);

// Warmup.
for (let i = 0; i < 1e4; ++i) {
    var positiveResult = opaqueAbs(i);
    if (positiveResult !== i)
        throw "Incorrect positive result at i = " + i + " result = " + positiveResult;
    var negativeResult = opaqueAbs(-i);
    if (negativeResult !== i)
        throw "Incorrect negative result at -i = " + -i + " result = " + negativeResult;
}

// Overflow.
for (let i = 0; i < 1e4; ++i) {
    var overflowResult = opaqueAbs(-2147483648);
    if (overflowResult !== 2147483648)
        throw "Incorrect overflow result at i = " + i + " result = " + overflowResult;
}
