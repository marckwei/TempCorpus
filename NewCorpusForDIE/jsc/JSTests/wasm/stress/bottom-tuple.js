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

//@ requireOptions("--useConcurrentJIT=0")

let buffer = new Uint8Array([
  0,97,115,109,1,0,0,0,1,7,1,96,0,3,127,127,127,3,2,1,0,4,6,
  1,111,1,16,255,1,5,4,1,1,4,4,6,13,1,124,0,68,0,0,0,0,0,0,
  0,0,11,7,23,4,2,116,49,1,0,2,109,49,2,0,2,103,49,3,0,4,109,
  97,105,110,0,0,10,116,1,114,0,65,0,16,0,65,65,65,0,16,0,65,
  0,65,0,109,16,0,13,0,0,109,65,109,16,0,0,16,4,16,109,0,109,
  109,109,0,83,0,151,151,151,151,67,212,0,67,0,168,33,67,67,
  67,175,99,175,0,67,212,0,67,0,168,33,67,67,67,128,42,151,
  151,151,1,0,0,0,0,0,0,129,151,151,151,151,151,67,212,0,67,
  0,168,33,67,67,67,128,42,151,0,175,0,67,0,0,0,0,0,0,65,65,
  65,0,65,0,11,0,14,4,110,97,109,101,1,7,1,0,4,109,97,105,110
]);

try {
    let module = new WebAssembly.Module(buffer);
    let instance = new WebAssembly.Instance(module);
    main = function() { return instance.exports.main(); };
    main();
} catch {
}
