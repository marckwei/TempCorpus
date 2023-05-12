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

function ThingA() {
}

ThingA.prototype = {f:1};

function ThingB() {
}

ThingB.prototype = {f:2};

function foo(o, p) {
    return p ? o.f : -1;
}

for (var i = 0; i < 10000; ++i) {
    foo(new ThingA(), true);
    foo(new ThingB(), true);
    ThingA.prototype.f = i;
    ThingB.prototype.f = i + 1;
}

function bar(p) {
    return foo(new ThingA(), p);
}

ThingA.prototype.f = 42;

for (var i = 0; i < 10000; ++i) {
    var result = bar(false);
    if (result != -1)
        throw new Error("Bad result in loop: " + result);
}

var result = bar(true);
if (result != 42)
    throw new Error("Bad result: " + result);


