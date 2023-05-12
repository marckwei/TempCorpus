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
noInline(Float32Array.prototype.subarray);
function createManySubs(howMany, a, b, c, d) {
    var storage = new Float32Array(howMany * 4);
    for (var k=0; k < howMany; ++k) {
        var r = storage.subarray(k * 4, (k + 1) * 4);
        r[0] = a; r[1] = b; r[2] = c; r[3] = d;

        // some action
        r[0] += 2.3; r[1] += 12; r[2] *= 3.14; r[3] -= 999.1;
    }
}

function go() {
    var subtt = [];

    const iterationCount = 25;
    const arrayCount = 20000;

    var a, b, c, d;

    for (var iter=0; iter < iterationCount; ++iter) {
        a = Math.random() * 10;
        b = Math.random() * 10;
        c = Math.random() * 10;
        d = Math.random() * 10;
        createManySubs(arrayCount, a, b, c, d);
    }

}

go();
