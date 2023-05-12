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
"Regression test for https://webkit.org/b/139418."
);

function InnerObjectNoSetter()
{
    this._enabled = false;
}

InnerObjectNoSetter.prototype = {
    get enabled()
    {
        return this._enabled;
    }
}

function StrictOuterObject(inner)
{
    this._innerObject = inner;
}

StrictOuterObject.prototype = {
    get enabled()
    {
        "use strict";
        return this._innerObject.enabled;
    },

    set enabled(x)
    {
        "use strict";
        this._innerObject.enabled = x;
    }
}

var innerNoSetter = new InnerObjectNoSetter;
var strictOuterNoInnerSetter = new StrictOuterObject(innerNoSetter);

for (var i = 0; i < 1000; ++i) {
    var  noExceptionWithMissingSetter = "Missing setter called with strict mode should throw exception and didn't!";
    try {
        strictOuterNoInnerSetter.enabled = true;
        throw  noExceptionWithMissingSetter;
    } catch (e) {
        if (e instanceof TypeError)
            ; // This is the expected exception
        else if (!((e instanceof String) && (e ==  noExceptionWithMissingSetter)))
            throw e // rethrow "missing exception" exception
        else
            throw "Missing setter called with strict mode threw wrong exception: " + e;
    }
    if (strictOuterNoInnerSetter.enabled)
        throw "Setter unexpectedly modified value";
}
