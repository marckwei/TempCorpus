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

var o = {};
var a = [];
var s = "str";

for (var i = 0; i < 1e5; ++i) {
    var [
        k00 = 0, k01 = 1, k02 = 2, k03 = 3, k04 = 4, k05 = 5, k06 = 6, k07 = 7, k08 = 8, k09 = 9,
        k10 = 0, k11 = 1, k12 = 2, k13 = 3, k14 = 4, k15 = 5, k16 = 6, k17 = 7, k18 = 8, k19 = 9,
        k20 = 0, k21 = 1, k22 = 2, k23 = 3, k24 = 4, k25 = 5, k26 = 6, k27 = 7, k28 = 8, k29 = 9,
        k30 = 0, k31 = 1, k32 = 2, k33 = 3, k34 = 4, k35 = 5, k36 = 6, k37 = 7, k38 = 8, k39 = 9,
        k40 = 0, k41 = 1, k42 = 2, k43 = 3, k44 = 4, k45 = 5, k46 = 6, k47 = 7, k48 = 8, k49 = 9,
        k50 = 0, k51 = 1, k52 = 2, k53 = 3, k54 = 4, k55 = 5, k56 = 6, k57 = 7, k58 = 8, k59 = 9,
        k60 = 0, k61 = 1, k62 = 2, k63 = 3, k64 = 4, k65 = 5, k66 = 6, k67 = 7, k68 = 8, k69 = 9,
        k70 = 0, k71 = 1, k72 = 2, k73 = 3, k74 = 4, k75 = 5, k76 = 6, k77 = 7, k78 = 8, k79 = 9,
        k80 = 0, k81 = 1, k82 = 2, k83 = 3, k84 = 4, k85 = 5, k86 = 6, k87 = 7, k88 = 8, k89 = 9,
        k90 = 0, k91 = 1, k92 = 2, k93 = 3, k94 = 4, k95 = 5, k96 = 6, k97 = 7, k98 = 8, k99 = 9
    ] = [
        o, a, s, o, a, s, o, a, s, o, a, s, o, a, s, o, o, s, o, a, s, o, o, s, o,
        o, a, s, o, a, s, o, a, s, o, a, s, o, a, s, o, o, s, o, a, s, o, o, s, o,
        o, a, s, o, a, s, o, a, s, o, a, s, o, a, s, o, o, s, o, a, s, o, o, s, o,
        o, a, s, o, a, s, o, a, s, o, a, s, o, a, s, o, o, s, o, a, s, o, o, s, o
    ];
}