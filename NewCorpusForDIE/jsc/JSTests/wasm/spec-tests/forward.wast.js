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


// forward.wast:1
let $1 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x86\x80\x80\x80\x00\x01\x60\x01\x7f\x01\x7f\x03\x83\x80\x80\x80\x00\x02\x00\x00\x07\x8e\x80\x80\x80\x00\x02\x04\x65\x76\x65\x6e\x00\x00\x03\x6f\x64\x64\x00\x01\x0a\xb3\x80\x80\x80\x00\x02\x94\x80\x80\x80\x00\x00\x20\x00\x41\x00\x46\x04\x7f\x41\x01\x05\x20\x00\x41\x01\x6b\x10\x01\x0b\x0b\x94\x80\x80\x80\x00\x00\x20\x00\x41\x00\x46\x04\x7f\x41\x00\x05\x20\x00\x41\x01\x6b\x10\x00\x0b\x0b");

// forward.wast:17
assert_return(() => call($1, "even", [13]), 0);

// forward.wast:18
assert_return(() => call($1, "even", [20]), 1);

// forward.wast:19
assert_return(() => call($1, "odd", [13]), 1);

// forward.wast:20
assert_return(() => call($1, "odd", [20]), 0);
