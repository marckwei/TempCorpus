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
function foo(args)
{
    var result = 0;
    for (var i = 0; i < args.length; ++i) {
        result += args[i];
        args[i] += i;
    }
    return result;
}

function bar(a, b, c, d)
{
    return [foo(arguments), a, b, c, d];
}

for (var i = 0; i < 10000; ++i) {
    var result = bar(i, i + 1, i + 2, i + 3);
    if (result.length != 5)
        throw "Bad result length in " + result;
    if (result[0] != i * 4 + 6)
        throw "Bad first element in " + result + "; expected " + (i * 3 + 6);
    if (result[1] != i)
        throw "Bad second element in " + result + "; expected " + i;
    if (result[2] != i + 1 + 1)
        throw "Bad third element in " + result + "; expected " + (i + 1 + 1);
    if (result[3] != i + 2 + 2)
        throw "Bad fourth element in " + result + "; expected " + (i + 2 + 2);
    if (result[4] != i + 3 + 3)
        throw "Bad fifth element in " + result + "; expected " + (i + 3 + 3);
}


