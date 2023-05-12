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

// wait-large.wast:1
let $1 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x99\x80\x80\x80\x00\x04\x60\x01\x7e\x00\x60\x02\x7f\x7f\x01\x7f\x60\x03\x7f\x7f\x7e\x01\x7f\x60\x03\x7f\x7e\x7e\x01\x7f\x03\x85\x80\x80\x80\x00\x04\x00\x01\x02\x03\x05\x86\x80\x80\x80\x00\x01\x03\x80\x40\x80\x40\x07\xcd\x80\x80\x80\x00\x04\x04\x69\x6e\x69\x74\x00\x00\x14\x6d\x65\x6d\x6f\x72\x79\x2e\x61\x74\x6f\x6d\x69\x63\x2e\x6e\x6f\x74\x69\x66\x79\x00\x01\x14\x6d\x65\x6d\x6f\x72\x79\x2e\x61\x74\x6f\x6d\x69\x63\x2e\x77\x61\x69\x74\x33\x32\x00\x02\x14\x6d\x65\x6d\x6f\x72\x79\x2e\x61\x74\x6f\x6d\x69\x63\x2e\x77\x61\x69\x74\x36\x34\x00\x03\x0a\xc3\x80\x80\x80\x00\x04\x8c\x80\x80\x80\x00\x00\x41\xf8\xff\xff\x3f\x20\x00\x37\x03\x00\x0b\x8a\x80\x80\x80\x00\x00\x20\x00\x20\x01\xfe\x00\x02\x00\x0b\x8c\x80\x80\x80\x00\x00\x20\x00\x20\x01\x20\x02\xfe\x01\x02\x00\x0b\x8c\x80\x80\x80\x00\x00\x20\x00\x20\x01\x20\x02\xfe\x02\x03\x00\x0b");

// wait-large.wast:14
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x88\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x00\x02\x8b\x80\x80\x80\x00\x01\x02\x24\x31\x04\x69\x6e\x69\x74\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x97\x80\x80\x80\x00\x01\x91\x80\x80\x80\x00\x00\x02\x40\x42\xff\xff\xff\xff\xff\xff\x3f\x10\x00\x0f\x0b\x00\x0b", exports("$1", $1)),  "run", []));  // run(() => call($1, "init", [int64("281_474_976_710_655")]))

// wait-large.wast:15
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x8b\x80\x80\x80\x00\x02\x60\x00\x00\x60\x03\x7f\x7f\x7e\x01\x7f\x02\x9b\x80\x80\x80\x00\x01\x02\x24\x31\x14\x6d\x65\x6d\x6f\x72\x79\x2e\x61\x74\x6f\x6d\x69\x63\x2e\x77\x61\x69\x74\x33\x32\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa0\x80\x80\x80\x00\x01\x9a\x80\x80\x80\x00\x00\x02\x40\x41\xf8\xff\xff\x3f\x41\x00\x42\x00\x10\x00\x01\x41\x01\x01\x46\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$1", $1)),  "run", []));  // assert_return(() => call($1, "memory.atomic.wait32", [134_217_720, 0, int64("0")]), 1)

// wait-large.wast:16
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x8b\x80\x80\x80\x00\x02\x60\x00\x00\x60\x03\x7f\x7e\x7e\x01\x7f\x02\x9b\x80\x80\x80\x00\x01\x02\x24\x31\x14\x6d\x65\x6d\x6f\x72\x79\x2e\x61\x74\x6f\x6d\x69\x63\x2e\x77\x61\x69\x74\x36\x34\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa0\x80\x80\x80\x00\x01\x9a\x80\x80\x80\x00\x00\x02\x40\x41\xf8\xff\xff\x3f\x42\x00\x42\x00\x10\x00\x01\x41\x01\x01\x46\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$1", $1)),  "run", []));  // assert_return(() => call($1, "memory.atomic.wait64", [134_217_720, int64("0"), int64("0")]), 1)

// wait-large.wast:17
assert_return(() => call($1, "memory.atomic.notify", [134_217_720, 0]), 0);
