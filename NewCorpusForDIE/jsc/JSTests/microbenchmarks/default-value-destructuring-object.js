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
    var {
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
    } = {
        k00: o, k01: a, k02: s, k03: o, k04: a, k05: s, k06: o, k07: a, k08: s, k09: o,
        k10: o, k11: a, k12: s, k13: o, k14: a, k15: s, k16: o, k17: a, k18: s, k19: o,
        k20: o, k21: a, k22: s, k23: o, k24: a, k25: s, k26: o, k27: a, k28: s, k29: o,
        k30: o, k31: a, k32: s, k33: o, k34: a, k35: s, k36: o, k37: a, k38: s, k39: o,
        k40: o, k41: a, k42: s, k43: o, k44: a, k45: s, k46: o, k47: a, k48: s, k49: o,
        k50: o, k51: a, k52: s, k53: o, k54: a, k55: s, k56: o, k57: a, k58: s, k59: o,
        k60: o, k61: a, k62: s, k63: o, k64: a, k65: s, k66: o, k67: a, k68: s, k69: o,
        k70: o, k71: a, k72: s, k73: o, k74: a, k75: s, k76: o, k77: a, k78: s, k79: o,
        k80: o, k81: a, k82: s, k83: o, k84: a, k85: s, k86: o, k87: a, k88: s, k89: o,
        k90: o, k91: a, k92: s, k93: o, k94: a, k95: s, k96: o, k97: a, k98: s, k99: o
    };
}
