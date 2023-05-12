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

/*
(module
  (type $0 (func))
      (type $1 (func (result f64)))
      (func $0 (type 0))
      (func $1
              (type 1)
              (loop (result f64) (f64.const 0.0) (i32.const 0) (br_table 1) (call 0))
              (br 0)
              (unreachable)
            )
      (export "runf64" (func 1))
)
*/

let buffer = new Uint8Array([ 0,97,115,109,1,0,0,0,1,136,128,128,128,0,2,96,0,0,96,0,1,124,3,131,128,128,128,0,2,0,1,7,138,128,128,128,0,1,6,114,117,110,102,54,52,0,1,10,165,128,128,128,0,2,130,128,128,128,0,0,11,152,128,128,128,0,0,3,124,68,0,0,0,0,0,0,0,0,65,0,14,0,1,16,0,11,12,0,0,11 ]);

let m = new WebAssembly.Instance(new WebAssembly.Module(buffer));
m.exports.runf64();
