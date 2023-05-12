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

function foo(o) {
    return o.f + 1;
}

noInline(foo);

function makeWithGetter() {
    var o = {};
    o.__defineGetter__("f", function() {
        throw "hello";
    });
    return o;
}

for (var i = 0; i < 100000; ++i) {
    var result = foo({f:23});
    if (result != 24)
        throw "Error: bad result: " + result;
    result = foo({g:12, f:13});
    if (result != 14)
        throw "Error: bad result: " + result;
    result = foo({g:12, h:13, f:14});
    if (result != 15)
        throw "Error: bad result: " + result;
}

var didThrow;
try {
    foo(makeWithGetter());
} catch (e) {
    didThrow = e;
}

if (didThrow != "hello")
    throw "Error: didn't throw or threw wrong exception: " + didThrow;
