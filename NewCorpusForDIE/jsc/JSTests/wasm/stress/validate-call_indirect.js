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

let imports = {};
let buffer = new Uint8Array([
  0,97,115,109,1,0,0,0,1,8,1,96,1,124,3,127,127,127,3,2,1,0,
  4,6,1,112,1,6,255,1,5,4,1,1,0,1,7,27,4,2,116,49,1,0,2,109,
  49,2,0,4,109,97,105,110,0,0,6,109,101,109,111,114,121,2,0,
  10,53,1,51,0,68,65,65,0,16,0,17,0,0,16,0,17,0,0,17,0,0,63,
  0,65,248,2,68,65,65,0,16,15,0,103,17,0,0,16,0,17,0,0,17,0,
  0,16,0,17,0,178,46,65,0,11,0,14,4,110,97,109,101,1,7,1,0,4,
  109,97,105,110
]);
var error = undefined;
try {
    let module = new WebAssembly.Module(buffer);
    let instance = new WebAssembly.Instance(module, imports);
    main = function() { return instance.exports.main(); };
    main();
} catch (err) {
    error = err;
}
if (!error || error.message !== "WebAssembly.Module doesn't validate: argument type mismatch in call_indirect, got I32, expected F64, in function at index 0 (evaluating 'new WebAssembly.Module(buffer)')")
    throw "Expected validation error";
