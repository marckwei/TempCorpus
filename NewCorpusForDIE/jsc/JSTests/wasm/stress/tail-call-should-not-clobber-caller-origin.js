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

//@ skip if $architecture == 'arm'
//@ skip
var wasm_code = new Uint8Array([0,97,115,109,1,0,0,0,1,142,128,128,128,0,3,96,3,127,127,127,1,127,96,0,0,96,0,0,3,132,128,128,128,0,3,0,1,1,4,133,128,128,128,0,1,112,1,3,7,5,132,128,128,128,0,1,1,16,32,13,131,128,128,128,0,1,0,1,6,160,129,128,128,0,15,127,0,65,0,11,124,1,68,0,0,0,0,0,0,0,0,11,124,1,68,0,0,0,0,0,0,0,0,11,127,1,65,0,11,123,1,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,125,1,67,0,0,0,0,11,125,1,67,0,0,0,0,11,126,1,66,0,11,126,1,66,0,11,126,1,66,0,11,123,1,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,126,1,66,0,11,123,1,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,123,1,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,11,126,1,66,0,11,7,136,128,128,128,0,1,4,109,97,105,110,0,0,9,145,128,128,128,0,1,6,0,65,0,11,112,3,210,0,11,210,1,11,210,2,11,10,249,128,128,128,0,3,58,8,1,126,1,125,1,124,2,126,1,127,3,126,1,125,2,126,16,2,16,2,16,2,16,2,16,2,16,2,2,127,16,1,65,236,1,11,65,0,65,0,120,65,0,65,0,16,0,1,254,61,1,236,217,179,231,14,11,45,3,15,127,1,123,3,127,6,127,67,0,0,0,0,67,42,185,185,0,92,25,65,0,11,65,172,22,253,15,18,2,103,253,23,0,253,88,0,243,230,205,251,8,0,11,14,6,2,124,3,126,1,124,2,123,1,124,3,127,11]);
var wasm_module = new WebAssembly.Module(wasm_code);
var wasm_instance = new WebAssembly.Instance(wasm_module);
var f = wasm_instance.exports.main;
try {
    f();
} catch { }
