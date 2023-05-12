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
"This test case checks variable resolution in the presence of both eval and with."
);

// Direct non-strict eval inside a with.

function freeVarInsideEvalAndWith(o, str)
{
    with (o)
    {
        return function () { return eval(str); }
    }
}

shouldBeTrue('freeVarInsideEvalAndWith({}, "true")()')
shouldBeFalse('freeVarInsideEvalAndWith({}, "false")()')
shouldBeTrue('freeVarInsideEvalAndWith({}, "var x = 10; x")() == 10')
shouldBeTrue('freeVarInsideEvalAndWith({}, "var x = 10; (function (){return x;})")()() == 10')

function localVarInsideEvalAndWith(o, str)
{
    with (o)
    {
        return eval(str);
    }
}

shouldBeTrue('localVarInsideEvalAndWith({}, "true")')
shouldBeFalse('localVarInsideEvalAndWith({}, "false")')
shouldBeTrue('localVarInsideEvalAndWith({}, "var x = true; x")')
shouldBeTrue('localVarInsideEvalAndWith({}, "var x = 10; (function (){return x;})")() == 10')

var y;
shouldBeTrue('localVarInsideEvalAndWith(y={x:false}, "var x = true; x && y.x")')
