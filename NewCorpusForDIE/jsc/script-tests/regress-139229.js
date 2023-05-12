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
"Regression test for https://webkit.org/b/139229. This test should not crash."
);

function InnerObjectNoGetter()
{
    this._enabled = false;
}

InnerObjectNoGetter.prototype = {
    set enabled(x)
    {
        this._enabled = x;
    }
}

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

function OuterObject(inner)
{
    this._innerObject = inner;
}

OuterObject.prototype = {
    get enabled()
    {
        return this._innerObject.enabled;
    },

    set enabled(x)
    {
        this._innerObject.enabled = x;
    }
}

var count = 0;

var innerNoGetter = new InnerObjectNoGetter;
var outerNoInnerGetter = new OuterObject(innerNoGetter);

for (var i = 0; i < 1000; ++i) {
    if (outerNoInnerGetter.enabled)
        ++count;
}

var innerNoSetter = new InnerObjectNoSetter;
var outerNoInnerSetter = new OuterObject(innerNoSetter);

for (var i = 0; i < 1000; ++i) {
    outerNoInnerSetter.enabled = true;
    if (outerNoInnerSetter.enabled)
        ++count;
}

if (count)
    throw "Error: bad result: count should be 0 but was: " + count;
