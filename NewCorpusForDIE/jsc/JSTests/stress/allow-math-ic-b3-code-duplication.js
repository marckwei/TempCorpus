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

//@ skip if $architecture == "x86"
//@ $skipModes << :lockdown if $buildType == "debug"

function test1() {
    var o1;
    for (let i = 0; i < 1000000; ++i) {
        var o2 = { f: { f: { f: { f: { f: { f: { f: { f: { f: { f: { f: { f: { } } } } } } } } } } } } };
    }
    return -o2;
}
test1();

function test2() {
    var o1;
    for (let i = 0; i < 1000000; ++i) {
        var o2 = { f: { f: { f: { f: { f: { f: { f: { f: { f: { f: { f: { f: { } } } } } } } } } } } } };
    }
    return o1 - o2;
}
test2();

function test3() {
    var o1;
    for (let i = 0; i < 1000000; ++i) {
        var o2 = { f: { f: { f: { f: { f: { f: { f: { f: { f: { f: { f: { f: { } } } } } } } } } } } } };
    }
    return o1 + o2;
}
test3();

function test4() {
    var o1;
    for (let i = 0; i < 1000000; ++i) {
        var o2 = { f: { f: { f: { f: { f: { f: { f: { f: { f: { f: { f: { f: { } } } } } } } } } } } } };
    }
    return o1 * o2;
}
test4();
