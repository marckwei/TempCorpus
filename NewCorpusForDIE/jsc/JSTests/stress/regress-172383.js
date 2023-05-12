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

// This test should not crash.

let x = undefined;

function foo(w, a0, a1) {
    var r0 = x % a0; 
    var r1 = w ^ a1; 

    var r4 = 3 % 7; 

    var r6 = w ^ 0;
    var r7 = r4 / r4; 
    var r9 = x - r7; 
    a1 = 0 + r0;

    var r11 = 0 & a0; 
    var r12 = r4 * a1; 
    var r7 = r11 & a0; 

    var r15 = r11 | r4; 
    var r16 = 0 & r1; 
    var r20 = 5 * a0; 

    var r2 = 0 + r9;
    var r26 = r11 | r15; 
    var r29 = r16 + 0;
    var r29 = r28 * r1; 
    var r34 = w / r12; 

    var r28 = 0 / r7;
    var r64 = r20 + 0;
    var r65 = 0 + r6;

    return a1;
}
noInline(foo);

for (var i = 0; i < 1886; i++)
    foo("q");

