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


// table_fill.wast:1
let $1 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x8c\x80\x80\x80\x00\x02\x60\x03\x7f\x6f\x7f\x00\x60\x01\x7f\x01\x6f\x03\x84\x80\x80\x80\x00\x03\x00\x00\x01\x04\x84\x80\x80\x80\x00\x01\x6f\x00\x0a\x07\x9c\x80\x80\x80\x00\x03\x04\x66\x69\x6c\x6c\x00\x00\x0b\x66\x69\x6c\x6c\x2d\x61\x62\x62\x72\x65\x76\x00\x01\x03\x67\x65\x74\x00\x02\x0a\xac\x80\x80\x80\x00\x03\x8b\x80\x80\x80\x00\x00\x20\x00\x20\x01\x20\x02\xfc\x11\x00\x0b\x8b\x80\x80\x80\x00\x00\x20\x00\x20\x01\x20\x02\xfc\x11\x00\x0b\x86\x80\x80\x80\x00\x00\x20\x00\x25\x00\x0b");

// table_fill.wast:17
assert_return(() => call($1, "get", [1]), null);

// table_fill.wast:18
assert_return(() => call($1, "get", [2]), null);

// table_fill.wast:19
assert_return(() => call($1, "get", [3]), null);

// table_fill.wast:20
assert_return(() => call($1, "get", [4]), null);

// table_fill.wast:21
assert_return(() => call($1, "get", [5]), null);

// table_fill.wast:23
assert_return(() => call($1, "fill", [2, externref(1), 3]));

// table_fill.wast:24
assert_return(() => call($1, "get", [1]), null);

// table_fill.wast:25
assert_return(() => call($1, "get", [2]), externref(1));

// table_fill.wast:26
assert_return(() => call($1, "get", [3]), externref(1));

// table_fill.wast:27
assert_return(() => call($1, "get", [4]), externref(1));

// table_fill.wast:28
assert_return(() => call($1, "get", [5]), null);

// table_fill.wast:30
assert_return(() => call($1, "fill", [4, externref(2), 2]));

// table_fill.wast:31
assert_return(() => call($1, "get", [3]), externref(1));

// table_fill.wast:32
assert_return(() => call($1, "get", [4]), externref(2));

// table_fill.wast:33
assert_return(() => call($1, "get", [5]), externref(2));

// table_fill.wast:34
assert_return(() => call($1, "get", [6]), null);

// table_fill.wast:36
assert_return(() => call($1, "fill", [4, externref(3), 0]));

// table_fill.wast:37
assert_return(() => call($1, "get", [3]), externref(1));

// table_fill.wast:38
assert_return(() => call($1, "get", [4]), externref(2));

// table_fill.wast:39
assert_return(() => call($1, "get", [5]), externref(2));

// table_fill.wast:41
assert_return(() => call($1, "fill", [8, externref(4), 2]));

// table_fill.wast:42
assert_return(() => call($1, "get", [7]), null);

// table_fill.wast:43
assert_return(() => call($1, "get", [8]), externref(4));

// table_fill.wast:44
assert_return(() => call($1, "get", [9]), externref(4));

// table_fill.wast:46
assert_return(() => call($1, "fill-abbrev", [9, null, 1]));

// table_fill.wast:47
assert_return(() => call($1, "get", [8]), externref(4));

// table_fill.wast:48
assert_return(() => call($1, "get", [9]), null);

// table_fill.wast:50
assert_return(() => call($1, "fill", [10, externref(5), 0]));

// table_fill.wast:51
assert_return(() => call($1, "get", [9]), null);

// table_fill.wast:53
assert_trap(() => call($1, "fill", [8, externref(6), 3]));

// table_fill.wast:57
assert_return(() => call($1, "get", [7]), null);

// table_fill.wast:58
assert_return(() => call($1, "get", [8]), externref(4));

// table_fill.wast:59
assert_return(() => call($1, "get", [9]), null);

// table_fill.wast:61
assert_trap(() => call($1, "fill", [11, null, 0]));

// table_fill.wast:66
assert_trap(() => call($1, "fill", [11, null, 10]));

// table_fill.wast:74
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x04\x84\x80\x80\x80\x00\x01\x6f\x00\x0a\x0a\x8b\x80\x80\x80\x00\x01\x85\x80\x80\x80\x00\x00\xfc\x11\x00\x0b");

// table_fill.wast:83
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x04\x84\x80\x80\x80\x00\x01\x6f\x00\x0a\x0a\x8f\x80\x80\x80\x00\x01\x89\x80\x80\x80\x00\x00\xd0\x6f\x41\x01\xfc\x11\x00\x0b");

// table_fill.wast:92
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x04\x84\x80\x80\x80\x00\x01\x6f\x00\x0a\x0a\x8f\x80\x80\x80\x00\x01\x89\x80\x80\x80\x00\x00\x41\x01\x41\x01\xfc\x11\x00\x0b");

// table_fill.wast:101
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x04\x84\x80\x80\x80\x00\x01\x6f\x00\x0a\x0a\x8f\x80\x80\x80\x00\x01\x89\x80\x80\x80\x00\x00\x41\x01\xd0\x6f\xfc\x11\x00\x0b");

// table_fill.wast:110
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x04\x84\x80\x80\x80\x00\x01\x6f\x00\x00\x0a\x94\x80\x80\x80\x00\x01\x8e\x80\x80\x80\x00\x00\x43\x00\x00\x80\x3f\xd0\x6f\x41\x01\xfc\x11\x00\x0b");

// table_fill.wast:119
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x01\x6f\x00\x03\x82\x80\x80\x80\x00\x01\x00\x04\x84\x80\x80\x80\x00\x01\x70\x00\x00\x0a\x91\x80\x80\x80\x00\x01\x8b\x80\x80\x80\x00\x00\x41\x01\x20\x00\x41\x01\xfc\x11\x00\x0b");

// table_fill.wast:128
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x04\x84\x80\x80\x80\x00\x01\x6f\x00\x00\x0a\x94\x80\x80\x80\x00\x01\x8e\x80\x80\x80\x00\x00\x41\x01\xd0\x6f\x43\x00\x00\x80\x3f\xfc\x11\x00\x0b");

// table_fill.wast:138
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x01\x6f\x00\x03\x82\x80\x80\x80\x00\x01\x00\x04\x87\x80\x80\x80\x00\x02\x6f\x00\x01\x70\x00\x01\x0a\x91\x80\x80\x80\x00\x01\x8b\x80\x80\x80\x00\x00\x41\x00\x20\x00\x41\x01\xfc\x11\x01\x0b");

// table_fill.wast:149
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x00\x01\x7f\x03\x82\x80\x80\x80\x00\x01\x00\x04\x84\x80\x80\x80\x00\x01\x6f\x00\x01\x0a\x91\x80\x80\x80\x00\x01\x8b\x80\x80\x80\x00\x00\x41\x00\xd0\x6f\x41\x01\xfc\x11\x00\x0b");