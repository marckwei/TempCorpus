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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
function mathTruncInt(i)
{
    return Math.trunc(i);
}
noInline(mathTruncInt);

for (var i = 0; i < 1e5; ++i)
    mathTruncInt(i);

function mathTruncDouble(i)
{
    return Math.trunc(i);
}
noInline(mathTruncDouble);

for (var i = 0; i < 1e5; ++i)
    mathTruncDouble(i * 0.6);

function mathTruncMixed(i)
{
    return Math.trunc(i);
}
noInline(mathTruncMixed);

for (var i = 0; i < 1e5; ++i) {
    if (i % 2 === 0)
        mathTruncDouble(i * 0.6);
    else
        mathTruncDouble(i);
}

function mathTruncDoubleDoesNotCareNegativeZero(i)
{
    return Math.trunc(i) | 0;
}
noInline(mathTruncDoubleDoesNotCareNegativeZero);

for (var i = 0; i < 1e5; ++i)
    mathTruncDoubleDoesNotCareNegativeZero(i * 0.6);
