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

var k0 = 0, k1 = 0, k2 = 0, k3 = 0, k4 = 0, k5 = 0, k6 = 0, k7 = 0, k8 = 0, k9 = 0, k10 = 0, k11 = 0, k12 = 0, k13 = 0, k14 = 0, k15 = 0, k16 = 0, k17 = 0, k18 = 0, k19 = 0, k20 = 0, k21 = 0, k22 = 0, k23 = 0, k24 = 0, k25 = 0, k26 = 0, k27 = 0, k28 = 0, k29 = 0, k30 = 0, k31 = 0, k32 = 0, k33 = 0, k34 = 0, k35 = 0, k36 = 0, k37 = 0, k38 = 0, k39 = 0, k40 = 0, k41 = 0, k42 = 0, k43 = 0, k44 = 0, k45 = 0, k46 = 0, k47 = 0, k48 = 0, k49 = 0;

for (var i = 0; i < 1e7; i++)
    k0 = i; k1 = i; k2 = i; k3 = i; k4 = i; k5 = i; k6 = i; k7 = i; k8 = i; k9 = i; k10 = i; k11 = i; k12 = i; k13 = i; k14 = i; k15 = i; k16 = i; k17 = i; k18 = i; k19 = i; k20 = i; k21 = i; k22 = i; k23 = i; k24 = i; k25 = i; k26 = i; k27 = i; k28 = i; k29 = i; k30 = i; k31 = i; k32 = i; k33 = i; k34 = i; k35 = i; k36 = i; k37 = i; k38 = i; k39 = i; k40 = i; k41 = i; k42 = i; k43 = i; k44 = i; k45 = i; k46 = i; k47 = i; k48 = i; k49 = i;
