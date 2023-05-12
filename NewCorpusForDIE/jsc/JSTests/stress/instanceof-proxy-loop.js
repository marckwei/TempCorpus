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

class Foo { }

function Bar() { }

var numberOfGetPrototypeOfCalls = 0;

var doBadThings = function() { };

Bar.prototype = new Proxy(
    {},
    {
        getPrototypeOf()
        {
            numberOfGetPrototypeOfCalls++;
            doBadThings();
            return Foo.prototype;
        }
    });

// Break some watchpoints.
var o = {f:42};
o.g = 43;

function foo(o, p)
{
    var result = o.f;
    for (var i = 0; i < 5; ++i)
        var _ = p instanceof Foo;
    return result + o.f;
}

noInline(foo);

for (var i = 0; i < 10000; ++i) {
    var result = foo({f:42}, new Bar());
    if (result != 84)
        throw "Error: bad result in loop: " + result;
}

if (numberOfGetPrototypeOfCalls != 10000 * 5)
    throw "Error: did not call getPrototypeOf() the right number of times";

var globalO = {f:42};
var didCallGetter = false;
doBadThings = function() {
    delete globalO.f;
    globalO.__defineGetter__("f", function() {
        didCallGetter = true;
        return 43;
    });
};

var result = foo(globalO, new Bar());
if (result != 85)
    throw "Error: bad result at end: " + result;
if (!didCallGetter)
    throw "Error: did not call getter";
if (numberOfGetPrototypeOfCalls != 10001 * 5)
    throw "Error: did not call getPrototypeOf() the right number of times at end";
