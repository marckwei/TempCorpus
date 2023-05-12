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


// ref_is_null.wast:1
let $1 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x97\x80\x80\x80\x00\x05\x60\x01\x70\x01\x7f\x60\x01\x6f\x01\x7f\x60\x00\x00\x60\x01\x6f\x00\x60\x01\x7f\x01\x7f\x03\x88\x80\x80\x80\x00\x07\x00\x01\x02\x03\x02\x04\x04\x04\x87\x80\x80\x80\x00\x02\x70\x00\x02\x6f\x00\x02\x07\xc7\x80\x80\x80\x00\x06\x07\x66\x75\x6e\x63\x72\x65\x66\x00\x00\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x04\x69\x6e\x69\x74\x00\x03\x06\x64\x65\x69\x6e\x69\x74\x00\x04\x0c\x66\x75\x6e\x63\x72\x65\x66\x2d\x65\x6c\x65\x6d\x00\x05\x0e\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x2d\x65\x6c\x65\x6d\x00\x06\x09\x87\x80\x80\x80\x00\x01\x00\x41\x01\x0b\x01\x02\x0a\xd6\x80\x80\x80\x00\x07\x85\x80\x80\x80\x00\x00\x20\x00\xd1\x0b\x85\x80\x80\x80\x00\x00\x20\x00\xd1\x0b\x82\x80\x80\x80\x00\x00\x0b\x88\x80\x80\x80\x00\x00\x41\x01\x20\x00\x26\x01\x0b\x8e\x80\x80\x80\x00\x00\x41\x01\xd0\x70\x26\x00\x41\x01\xd0\x6f\x26\x01\x0b\x88\x80\x80\x80\x00\x00\x20\x00\x25\x00\x10\x00\x0b\x88\x80\x80\x80\x00\x00\x20\x00\x25\x01\x10\x01\x0b");

// ref_is_null.wast:30
assert_return(() => call($1, "funcref", [null]), 1);

// ref_is_null.wast:31
assert_return(() => call($1, "externref", [null]), 1);

// ref_is_null.wast:33
assert_return(() => call($1, "externref", [externref(1)]), 0);

// ref_is_null.wast:35
run(() => call($1, "init", [externref(0)]));

// ref_is_null.wast:37
assert_return(() => call($1, "funcref-elem", [0]), 1);

// ref_is_null.wast:38
assert_return(() => call($1, "externref-elem", [0]), 1);

// ref_is_null.wast:40
assert_return(() => call($1, "funcref-elem", [1]), 0);

// ref_is_null.wast:41
assert_return(() => call($1, "externref-elem", [1]), 0);

// ref_is_null.wast:43
run(() => call($1, "deinit", []));

// ref_is_null.wast:45
assert_return(() => call($1, "funcref-elem", [0]), 1);

// ref_is_null.wast:46
assert_return(() => call($1, "externref-elem", [0]), 1);

// ref_is_null.wast:48
assert_return(() => call($1, "funcref-elem", [1]), 1);

// ref_is_null.wast:49
assert_return(() => call($1, "externref-elem", [1]), 1);

// ref_is_null.wast:51
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x01\x7f\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8b\x80\x80\x80\x00\x01\x85\x80\x80\x80\x00\x00\x20\x00\xd1\x0b");

// ref_is_null.wast:55
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x89\x80\x80\x80\x00\x01\x83\x80\x80\x80\x00\x00\xd1\x0b");
