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

var globalO;

function Foo()
{
    this.f = 42;
}

class RealBar extends Foo {
    constructor()
    {
        var o = globalO;
        var result = o.f;
        super();
        result += o.f;
        this.result = result;
    }
}

var doIntercept = false;
var didExecuteFGetter = false;
var Bar = new Proxy(RealBar, {
    get: function(target, property, receiver) {
        if (property == "prototype" && doIntercept) {
            globalO.__defineGetter__("f", function() {
                didExecuteFGetter = true;
                return 666;
            });
        }
        return Reflect.get(target, property, receiver);
    }
});

noInline(RealBar);

for (var i = 0; i < 10000; ++i) {
    (function() {
        globalO = {f:43};
        var result = new Bar().result;
        if (result != 86)
            throw "bad result in loop: " + result;
    })();
}

doIntercept = true;
globalO = {f:43};
var result = new Bar().result;
if (result != 709)
    throw "bad result at end: " + result;
if (!didExecuteFGetter)
    throw "did not execute f getter";

