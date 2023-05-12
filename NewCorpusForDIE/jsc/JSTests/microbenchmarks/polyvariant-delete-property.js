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

//@ skip if $model == "Apple Watch Series 3"
//@ $skipModes << :lockdown if $buildType == "debug"

function assert(condition) {
    if (!condition)
        throw new Error("assertion failed")
}

function blackbox(x) {
    return x
}
noInline(blackbox)

function polyvariant(x) {
    assert(delete x.x)
}

function doAlloc1() {
    let obj = {}
    obj.x = 5
    obj.y = 7
    obj.y = blackbox(obj.y)
    polyvariant(obj)
    return obj.y
}
noInline(doAlloc1)

function doAlloc2() {
    let obj = {}
    obj.x = 5
    obj.b = 9
    obj.y = 7
    obj.y = blackbox(obj.y)
    polyvariant(obj)
    return obj.y
}
noInline(doAlloc2)

for (let i = 0; i < 10000000; ++i) {
    doAlloc1()
    doAlloc2()
}
