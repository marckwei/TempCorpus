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


// type-rec.wast:3
let $1 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x8f\x80\x80\x80\x00\x02\x4f\x02\x60\x00\x00\x5f\x00\x4f\x02\x60\x00\x00\x5f\x00\x03\x82\x80\x80\x80\x00\x01\x02\x06\x87\x80\x80\x80\x00\x01\x6b\x00\x00\xd2\x00\x0b\x0a\x88\x80\x80\x80\x00\x01\x82\x80\x80\x80\x00\x00\x0b");

// type-rec.wast:10
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x8f\x80\x80\x80\x00\x02\x4f\x02\x60\x00\x00\x5f\x00\x4f\x02\x5f\x00\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x03\x06\x87\x80\x80\x80\x00\x01\x6b\x00\x00\xd2\x00\x0b\x0a\x88\x80\x80\x80\x00\x01\x82\x80\x80\x80\x00\x00\x0b");

// type-rec.wast:20
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x92\x80\x80\x80\x00\x02\x4f\x02\x60\x00\x00\x5f\x00\x4f\x03\x60\x00\x00\x5f\x00\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x02\x06\x87\x80\x80\x80\x00\x01\x6b\x00\x00\xd2\x00\x0b\x0a\x88\x80\x80\x80\x00\x01\x82\x80\x80\x80\x00\x00\x0b");

// type-rec.wast:33
let $2 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x88\x80\x80\x80\x00\x01\x4f\x02\x60\x00\x00\x5f\x00\x03\x82\x80\x80\x80\x00\x01\x00\x07\x85\x80\x80\x80\x00\x01\x01\x66\x00\x00\x0a\x88\x80\x80\x80\x00\x01\x82\x80\x80\x80\x00\x00\x0b");
let $M = $2;

// type-rec.wast:37
register("M", $M)

// type-rec.wast:39
let $3 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x88\x80\x80\x80\x00\x01\x4f\x02\x60\x00\x00\x5f\x00\x02\x87\x80\x80\x80\x00\x01\x01\x4d\x01\x66\x00\x00");

// type-rec.wast:44
assert_unlinkable("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x88\x80\x80\x80\x00\x01\x4f\x02\x5f\x00\x60\x00\x00\x02\x87\x80\x80\x80\x00\x01\x01\x4d\x01\x66\x00\x01");

// type-rec.wast:52
assert_unlinkable("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x02\x87\x80\x80\x80\x00\x01\x01\x4d\x01\x66\x00\x00");

// type-rec.wast:63
let $4 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x8f\x80\x80\x80\x00\x02\x4f\x02\x60\x00\x00\x5f\x00\x4f\x02\x60\x00\x00\x5f\x00\x03\x83\x80\x80\x80\x00\x02\x00\x00\x04\x85\x80\x80\x80\x00\x01\x70\x01\x01\x01\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x09\x8b\x80\x80\x80\x00\x01\x06\x00\x41\x00\x0b\x70\x01\xd2\x00\x0b\x0a\x94\x80\x80\x80\x00\x02\x82\x80\x80\x80\x00\x00\x0b\x87\x80\x80\x80\x00\x00\x41\x00\x11\x02\x00\x0b");

// type-rec.wast:70
assert_return(() => call($4, "run", []));

// type-rec.wast:72
let $5 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x8f\x80\x80\x80\x00\x02\x4f\x02\x60\x00\x00\x5f\x00\x4f\x02\x5f\x00\x60\x00\x00\x03\x83\x80\x80\x80\x00\x02\x00\x00\x04\x85\x80\x80\x80\x00\x01\x70\x01\x01\x01\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x09\x8b\x80\x80\x80\x00\x01\x06\x00\x41\x00\x0b\x70\x01\xd2\x00\x0b\x0a\x94\x80\x80\x80\x00\x02\x82\x80\x80\x80\x00\x00\x0b\x87\x80\x80\x80\x00\x00\x41\x00\x11\x03\x00\x0b");

// type-rec.wast:79
assert_trap(() => call($5, "run", []));

// type-rec.wast:81
let $6 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x8b\x80\x80\x80\x00\x02\x4f\x02\x60\x00\x00\x5f\x00\x60\x00\x00\x03\x83\x80\x80\x80\x00\x02\x00\x00\x04\x85\x80\x80\x80\x00\x01\x70\x01\x01\x01\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x09\x8b\x80\x80\x80\x00\x01\x06\x00\x41\x00\x0b\x70\x01\xd2\x00\x0b\x0a\x94\x80\x80\x80\x00\x02\x82\x80\x80\x80\x00\x00\x0b\x87\x80\x80\x80\x00\x00\x41\x00\x11\x02\x00\x0b");

// type-rec.wast:88
assert_trap(() => call($6, "run", []));
