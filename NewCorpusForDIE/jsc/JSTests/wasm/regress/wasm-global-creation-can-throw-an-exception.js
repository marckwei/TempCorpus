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

let wasmCode = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 7, 1, 96, 2, 126, 127, 1, 127, 3, 2, 1, 0, 4, 4, 1, 112, 0, 4, 6, 46, 5, 127, 0, 65, 42, 11, 125, 0, 67, 116, 0, 0, 77, 11, 124, 0, 68, 131, 136, 136, 0, 0, 0, 255, 255, 11, 125, 0, 67, 0, 0, 9, 127, 11, 124, 0, 68, 0, 60, 0, 0, 0, 0, 248, 127, 11, 7, 64, 7, 5, 116, 97, 98, 63, 69, 1, 0, 3, 125, 117, 109, 0, 0, 6, 97, 61, 34, 0, 13, 114, 3, 0, 7, 79, 124, 82, 37, 101, 32, 49, 3, 1, 7, 65, 65, 65, 65, 65, 65, 65, 3, 2, 7, 97, 110, 115, 119, 101, 114, 60, 3, 3, 7, 97, 110, 115, 119, 101, 114, 52, 3, 4, 9, 7, 1, 0, 65, 0, 11, 1, 0, 10, 9, 1, 7, 0, 32, 1, 0, 1, 0, 11]);
let wasmModule = new WebAssembly.Module(wasmCode);
new WebAssembly.Instance(wasmModule, {});
