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

//@ requireOptions("--useWebAssemblySIMD=1")
//@ skip if !$isSIMDPlatform
import * as assert from '../assert.js';

var wasm_code = new Uint8Array([0,97,115,109,1,0,0,0,1,203,128,128,128,0,7,96,3,127,127,127,1,127,96,1,123,0,96,1,126,15,125,126,125,127,123,125,127,126,124,125,127,127,127,126,127,96,1,126,1,126,96,1,126,8,127,123,125,127,126,124,125,127,96,1,126,4,127,127,126,127,96,15,125,126,125,127,123,125,127,126,124,125,127,127,127,126,127,1,127,3,130,128,128,128,0,1,0,4,133,128,128,128,0,1,112,1,1,1,5,132,128,128,128,0,1,1,16,32,13,131,128,128,128,0,1,0,1,7,136,128,128,128,0,1,4,109,97,105,110,0,0,9,139,128,128,128,0,1,6,0,65,0,11,112,1,210,0,11,10,254,128,128,128,0,1,124,1,1,126,66,129,134,2,3,2,180,66,0,2,3,1,11,67,127,0,0,0,66,0,2,3,1,11,2,4,167,65,0,253,15,67,0,0,0,0,65,0,66,0,68,0,0,0,0,0,0,0,0,67,0,0,0,0,65,0,11,32,3,65,0,65,0,119,65,223,1,119,65,169,1,104,105,104,65,0,253,15,8,0,69,69,119,4,5,167,65,0,66,0,65,0,5,167,65,0,66,0,65,0,11,11,2,6,26,26,26,26,26,26,26,26,26,26,26,26,26,26,168,11,11]);
var wasm_module = new WebAssembly.Module(wasm_code);
var wasm_instance = new WebAssembly.Instance(wasm_module);
var f = wasm_instance.exports.main;

assert.throws(() => {
    f();
}, TypeError, `an exported wasm function cannot contain a v128 parameter or return value`);
