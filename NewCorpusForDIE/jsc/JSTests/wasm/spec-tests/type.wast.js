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


// type.wast:3
let $1 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x81\x80\x80\x00\x17\x60\x00\x00\x60\x00\x00\x60\x01\x7f\x00\x60\x01\x7f\x00\x60\x00\x01\x7f\x60\x01\x7f\x01\x7f\x60\x01\x7f\x01\x7f\x60\x02\x7d\x7c\x00\x60\x00\x02\x7e\x7d\x60\x02\x7f\x7e\x02\x7d\x7c\x60\x02\x7d\x7c\x00\x60\x02\x7d\x7c\x00\x60\x02\x7d\x7c\x00\x60\x02\x7d\x7c\x00\x60\x00\x02\x7e\x7d\x60\x02\x7f\x7e\x02\x7d\x7c\x60\x02\x7f\x7e\x02\x7d\x7c\x60\x06\x7d\x7c\x7f\x7c\x7f\x7f\x00\x60\x00\x05\x7e\x7e\x7d\x7d\x7f\x60\x04\x7f\x7f\x7e\x7f\x04\x7d\x7c\x7c\x7f\x60\x03\x7d\x7c\x7f\x00\x60\x00\x03\x7e\x7e\x7d\x60\x05\x7f\x7f\x7e\x7f\x7f\x04\x7d\x7c\x7c\x7f");

// type.wast:43
assert_malformed("\x3c\x6d\x61\x6c\x66\x6f\x72\x6d\x65\x64\x20\x71\x75\x6f\x74\x65\x3e");

// type.wast:47
assert_malformed("\x3c\x6d\x61\x6c\x66\x6f\x72\x6d\x65\x64\x20\x71\x75\x6f\x74\x65\x3e");
