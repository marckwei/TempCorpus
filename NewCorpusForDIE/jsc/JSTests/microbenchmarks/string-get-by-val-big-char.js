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
function foo(string) {
    var result1, result2;
    var m_z = 1;
    var m_w = 2;
    for (var i = 0; i < 100000; ++i) {
        result1 = string[0]; // This will be slow, but we're testing if we stay in the DFG.
        for (var j = 0; j < 10; ++j) {
            m_z = (36969 * (m_z & 65535) + (m_z >> 16)) | 0;
            m_w = (18000 * (m_w & 65535) + (m_w >> 16)) | 0;
            result2 = ((m_z << 16) + m_w) | 0;
        }
    }
    return [result1, result2];
}

var lBar = String.fromCharCode(322);

var result = foo(lBar);
if (result[0] != lBar)
    throw "Bad result1: " + result[0];
if (result[1] != 561434430)
    throw "Bad result2: " + result[1];
