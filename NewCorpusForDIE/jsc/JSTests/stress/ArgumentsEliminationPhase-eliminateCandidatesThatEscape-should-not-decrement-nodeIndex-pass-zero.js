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

//@ requireOptions("--thresholdForFTLOptimizeAfterWarmUp=1000")

function __v0(__v1, ...__v2) {
    if (__v1)
        var __v1 = {
            9.5471568547800008: '\\p{sc=Inherited}'
        };
}
noInline();
function __v2(__v2, ...__v1) {
    return __v1;
}
function __v5(__v6, __v1, __v4, __v7, ...__v0) {
    return __v3(__v6, __v1, __v4, __v7);
}
function __v3(__v4, ...__v1) {
    return __v0(...[3011], 42, ...__v2());
}
[93847];
__v5(__v0);
for (let __v1 = 0; __v1 < 10000; __v1++) {
    let __v4 = 'Memory corruption'.normalize('NFC');
    __v0('I am not global'.keys === 7);
    ['__v6', '__v2', '__v1', '__v3', '__v4', '__v5'];
    __v5(__v1, __v1 + 1, __v1 + __v1, __v1 + 0, ...[3011, 3013]);
    __v5(...[3011, 3013], 42, ...String(...[]));
    __v0('I am not global'.keys === 7);
    __v0(__v4[4] === __v1 + 1);
    __v0();
    __v0(__v0[6] === (__v1 != 3));
}
