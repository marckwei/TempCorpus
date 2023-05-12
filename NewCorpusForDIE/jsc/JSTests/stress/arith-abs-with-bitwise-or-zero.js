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
    return Math.abs(value)|0;
}
noInline(opaqueAbs);

for (let i = 0; i < 1e4; ++i) {
    var positiveResult = opaqueAbs(i);
    if (positiveResult !== i)
        throw "Incorrect result at i = " + i + " result = " + positiveResult;
    var negativeResult = opaqueAbs(-i);
    if (negativeResult !== i)
        throw "Incorrect result at -i = " + -i + " result = " + negativeResult;
}


var intMax = 2147483647;
var intMin = 2147483647;

var intMaxResult = opaqueAbs(intMax);
if (intMaxResult !== intMax)
    throw "Incorrect result at intMax result = " + intMaxResult;
var intMaxResult = opaqueAbs(intMin);
if (intMaxResult !== intMin)
    throw "Incorrect result at intMax result = " + intMaxResult;

// Numbers around IntMax/IntMin. Numbers outside the bounds are doubles and opaqueAbs()
// has to OSR Exit to handle them correctly.
for (let i = intMax - 1e4; i < intMax + 1e4; ++i) {
    var positiveResult = opaqueAbs(i);
    if (positiveResult !== (i|0))
        throw "Incorrect result at i = " + i + " result = " + positiveResult;
    var negativeResult = opaqueAbs(-i);
    if (negativeResult !== (i|0))
        throw "Incorrect result at -i = " + -i + " result = " + negativeResult;
}

// Edge cases and exits.
if (opaqueAbs(NaN) !== 0)
    throw "opaqueAbs(NaN) failed.";
if (opaqueAbs(Infinity) !== 0)
    throw "opaqueAbs(Infinity) failed.";
if (opaqueAbs(-Infinity) !== 0)
    throw "opaqueAbs(-Infinity) failed.";
if (opaqueAbs(null) !== 0)
    throw "opaqueAbs(null) failed.";
if (opaqueAbs(undefined) !== 0)
    throw "opaqueAbs(undefined) failed.";
if (opaqueAbs(true) !== 1)
    throw "opaqueAbs(true) failed.";
if (opaqueAbs(false) !== 0)
    throw "opaqueAbs(false) failed.";
if (opaqueAbs({foo:"bar"}) !== 0)
    throw "opaqueAbs({foo:'bar'}) failed.";
