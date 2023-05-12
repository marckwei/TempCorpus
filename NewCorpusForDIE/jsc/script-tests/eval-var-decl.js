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
"This test case checks whether variables cause properties to be defined even before reaching the declaration statement in various cases."
);

shouldBeTrue('this.hasOwnProperty("foo")');
var foo = 3;

delete bar;
shouldBeTrue('this.hasOwnProperty("bar")');
var bar = 3;

var firstEvalResult = eval('var result = this.hasOwnProperty("y"); var y = 3; result');
shouldBeTrue("firstEvalResult");

var secondEvalResult = eval('delete x; var result = this.hasOwnProperty("x"); var x = 3; result');
shouldBeFalse("secondEvalResult");

var thirdEvalResult = false;
try {
    thirdEvalResult = (function(){ var x=false; try { throw ""; } catch (e) { eval("var x = true;"); } return x; })();
} catch (e) {
    thirdEvalResult = "Threw exception!";
}
shouldBeTrue("thirdEvalResult");

// Check that the correct this value is passed to a function called having been caught from a throw, where the catch block contains an eval (bug#).
function checkThis()
{
    "use strict";
    return this === undefined;
}
function testEvalInCatch()
{
    try {
        throw checkThis;
    } catch(e) {
        eval('');
        return e();
    }
    return false;
}
shouldBeTrue("testEvalInCatch()");
