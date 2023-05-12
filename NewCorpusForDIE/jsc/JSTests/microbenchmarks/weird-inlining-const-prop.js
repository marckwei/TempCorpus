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

//@ skip if $model == "Apple Watch Series 3" # added by mark-jsc-stress-test.py
function foo(o, p, q) {
    var x = o[0];
    var y;
    if (p) {
        x();
        if (q) {
            x();
            y = 42;
        } else {
            x();
            y = 11;
        }
    } else
        y = 23;
    o[1]++;
    return x;
}

function bar(o, p, q) {
    var x = o[0];
    var y;
    if (p)
        y = 23;
    else {
        x();
        if (q) {
            x();
            y = 42;
        } else {
            x();
            y = 11;
        }
    }
    o[1]++;
    return x;
}

function fuzz() { }

noInline(foo);
noInline(bar);

function testImpl(f, x, p) {
    var result = f([fuzz, x], p, false);
    if (result != fuzz)
        throw "Error: bad result: " + result;
}

function test(x, p) {
    testImpl(foo, x, p);
    testImpl(bar, x, !p);
}

for (var i = 0; i < 10000; ++i)
    test(0, true);

for (var i = 0; i < 10000; ++i)
    test(0, false);

test(0.5, true);
