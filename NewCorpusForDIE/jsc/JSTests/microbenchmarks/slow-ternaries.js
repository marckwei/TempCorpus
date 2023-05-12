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
var asmMod = function test (glob, env, b) {
  'use asm';
  const i8 = new glob.Int8Array(b);
  function f() {
    var i = 0; var r = 0;
    for (i = 0; (i | 0) < 3000000; i = (i + 1) | 0) {
      if ((i8[(i & 0xff) >> 0] | 0) == 1 ? ((i8[((i & 0xff) + 1) >> 0] | 0) == 2 ? ((i8[((i & 0xff) + 2) >> 0] | 0) == 3 ? (i8[((i & 0xff) + 3) >> 0] | 0) == 4 : 0) : 0) : 0)
        r = 1;
    }
    return r | 0;
  }
  return f;
};
var buffer1 = new ArrayBuffer(64*1024);
var asm1 = asmMod(this, {}, buffer1);
for (var i = 0; i < 5; i++) asm1();
