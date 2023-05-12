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

var doEffect = false;
var didEffect = false;

function bar(o, p)
{
    if (doEffect) {
        delete p.g;
        p.__defineGetter__("g", () => {
            didEffect = true;
            return 42;
        });
    }
}

noInline(bar);

function foo(o, p) {
    var result = o.f + p.g;
    bar(o, p);
    return result + o.f + p.g;
}

noInline(foo);

var o = {g: 1};
o.h = 2;

for (var i = 0; i < 10000; ++i) {
    var result = foo({f: 1}, {g: 3});
    if (result != 8)
        throw "Error: bad result in loop: " + result;
}

doEffect = true;
var result = foo({f: 1}, {g: 3});
if (result != 47)
    throw "Error: bad result at end: " + result;
if (!didEffect)
    throw "Error: did not do effect";
