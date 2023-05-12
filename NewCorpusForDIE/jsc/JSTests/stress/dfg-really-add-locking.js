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

//@ slow!
//@ runDefault("--collectContinuously=1", "--useGenerationalGC=0")

for (var i = 0; i < 10; ++i) {
    runString(`
        var g;
        (function () {
            for (var i = 0; i < 100000; ++i) {
                var o = {};
                o.a = 0;
                o.b = 1;
                o.c = 2;
                o.d = 3;
                o.e = 4;
                o.f = 5;
                o.g = 6;
                o.h = 7;
                o.i = 8;
                o.j = 9;
                o.k = 10;
                o.l = 11;
                o.m = 12;
                o.n = 13;
                o.o = 14;
                o.p = 15;
                o.q = 0;
                o.r = 1;
                o.s = 2;
                o.t = 3;
                o.u = 4;
                o.v = 5;
                o.w = 6;
                o.x = 7;
                o.y = 8;
                o.z = 9;
                g = o;
            }
            return g;
        }());
    `);
}
