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

function canSimplifyToFloat(a, b)
{
    return Math.fround(a) === Math.fround(b);
}
noInline(canSimplifyToFloat);

function canSimplifyToFloatWithConstant(a)
{
    return Math.fround(a) === 1.0;
}
noInline(canSimplifyToFloatWithConstant);

function cannotSimplifyA(a, b)
{
    return a === Math.fround(b);
}
noInline(cannotSimplifyA);

function cannotSimplifyB(a, b)
{
    return Math.fround(a) === b;
}
noInline(cannotSimplifyB);

for (let i = 1; i < 1e4; ++i) {
    if (canSimplifyToFloat(Math.PI, Math.PI) !== true)
        throw "Failed canSimplifyToFloat(Math.PI, Math.PI)";
    if (canSimplifyToFloat(Math.LN2, Math.PI) !== false)
        throw "Failed canSimplifyToFloat(Math.LN2, Math.PI)";

    if (canSimplifyToFloatWithConstant(Math.PI) !== false)
        throw "Failed canSimplifyToFloatWithConstant(Math.PI)";
    if (canSimplifyToFloatWithConstant(1) !== true)
        throw "Failed canSimplifyToFloatWithConstant(1)";

    if (cannotSimplifyA(Math.PI, Math.PI) !== false)
        throw "Failed cannotSimplifyA(Math.PI, Math.PI)";
    if (cannotSimplifyA(Math.fround(Math.PI), Math.PI) !== true)
        throw "Failed cannotSimplifyA(Math.round(Math.PI), Math.PI)";
    if (cannotSimplifyA(Math.LN2, Math.PI) !== false)
        throw "Failed cannotSimplifyA(Math.LN2, Math.PI)";

    if (cannotSimplifyB(Math.PI, Math.PI) !== false)
        throw "Failed cannotSimplifyA(Math.PI, Math.PI)";
    if (cannotSimplifyB(Math.PI, Math.fround(Math.PI)) !== true)
        throw "Failed cannotSimplifyA(Math.round(Math.PI), Math.PI)";
    if (cannotSimplifyB(Math.LN2, Math.PI) !== false)
        throw "Failed cannotSimplifyA(Math.LN2, Math.PI)";
}
