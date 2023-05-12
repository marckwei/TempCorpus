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

function bar() {
    return 42.5;
}
noInline(bar);

function baz(value) {
    if (value != 42.5)
        throw "Error: bad value: " + value;
}
noInline(baz);

var True = true;
function foo(a) {
    var x = bar();
    var tmp = 0;
    if (True) {
        var tmp2 = x;
        tmp = a + 1;
        baz(tmp2);
    }
    return x + 1 + tmp;
}
noInline(foo);

for (var i = 0; i < 10000; ++i) {
    var result = foo(1);
    if (result != 42.5 + 1 + 1 + 1)
        throw "Error: bad result: " + result;
}

var result = foo(2147483647);
if (result != 42.5 + 1 + 2147483647 + 1)
    throw "Error: bad result at end: " + result;
