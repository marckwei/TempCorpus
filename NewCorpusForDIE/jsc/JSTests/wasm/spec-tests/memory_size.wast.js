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


// memory_size.wast:1
let $1 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x01\x7f\x60\x01\x7f\x00\x03\x83\x80\x80\x80\x00\x02\x00\x01\x05\x83\x80\x80\x80\x00\x01\x00\x00\x07\x8f\x80\x80\x80\x00\x02\x04\x73\x69\x7a\x65\x00\x00\x04\x67\x72\x6f\x77\x00\x01\x0a\x96\x80\x80\x80\x00\x02\x84\x80\x80\x80\x00\x00\x3f\x00\x0b\x87\x80\x80\x80\x00\x00\x20\x00\x40\x00\x1a\x0b");

// memory_size.wast:7
assert_return(() => call($1, "size", []), 0);

// memory_size.wast:8
assert_return(() => call($1, "grow", [1]));

// memory_size.wast:9
assert_return(() => call($1, "size", []), 1);

// memory_size.wast:10
assert_return(() => call($1, "grow", [4]));

// memory_size.wast:11
assert_return(() => call($1, "size", []), 5);

// memory_size.wast:12
assert_return(() => call($1, "grow", [0]));

// memory_size.wast:13
assert_return(() => call($1, "size", []), 5);

// memory_size.wast:15
let $2 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x01\x7f\x60\x01\x7f\x00\x03\x83\x80\x80\x80\x00\x02\x00\x01\x05\x83\x80\x80\x80\x00\x01\x00\x01\x07\x8f\x80\x80\x80\x00\x02\x04\x73\x69\x7a\x65\x00\x00\x04\x67\x72\x6f\x77\x00\x01\x0a\x96\x80\x80\x80\x00\x02\x84\x80\x80\x80\x00\x00\x3f\x00\x0b\x87\x80\x80\x80\x00\x00\x20\x00\x40\x00\x1a\x0b");

// memory_size.wast:21
assert_return(() => call($2, "size", []), 1);

// memory_size.wast:22
assert_return(() => call($2, "grow", [1]));

// memory_size.wast:23
assert_return(() => call($2, "size", []), 2);

// memory_size.wast:24
assert_return(() => call($2, "grow", [4]));

// memory_size.wast:25
assert_return(() => call($2, "size", []), 6);

// memory_size.wast:26
assert_return(() => call($2, "grow", [0]));

// memory_size.wast:27
assert_return(() => call($2, "size", []), 6);

// memory_size.wast:29
let $3 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x01\x7f\x60\x01\x7f\x00\x03\x83\x80\x80\x80\x00\x02\x00\x01\x05\x84\x80\x80\x80\x00\x01\x01\x00\x02\x07\x8f\x80\x80\x80\x00\x02\x04\x73\x69\x7a\x65\x00\x00\x04\x67\x72\x6f\x77\x00\x01\x0a\x96\x80\x80\x80\x00\x02\x84\x80\x80\x80\x00\x00\x3f\x00\x0b\x87\x80\x80\x80\x00\x00\x20\x00\x40\x00\x1a\x0b");

// memory_size.wast:35
assert_return(() => call($3, "size", []), 0);

// memory_size.wast:36
assert_return(() => call($3, "grow", [3]));

// memory_size.wast:37
assert_return(() => call($3, "size", []), 0);

// memory_size.wast:38
assert_return(() => call($3, "grow", [1]));

// memory_size.wast:39
assert_return(() => call($3, "size", []), 1);

// memory_size.wast:40
assert_return(() => call($3, "grow", [0]));

// memory_size.wast:41
assert_return(() => call($3, "size", []), 1);

// memory_size.wast:42
assert_return(() => call($3, "grow", [4]));

// memory_size.wast:43
assert_return(() => call($3, "size", []), 1);

// memory_size.wast:44
assert_return(() => call($3, "grow", [1]));

// memory_size.wast:45
assert_return(() => call($3, "size", []), 2);

// memory_size.wast:47
let $4 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x01\x7f\x60\x01\x7f\x00\x03\x83\x80\x80\x80\x00\x02\x00\x01\x05\x84\x80\x80\x80\x00\x01\x01\x03\x08\x07\x8f\x80\x80\x80\x00\x02\x04\x73\x69\x7a\x65\x00\x00\x04\x67\x72\x6f\x77\x00\x01\x0a\x96\x80\x80\x80\x00\x02\x84\x80\x80\x80\x00\x00\x3f\x00\x0b\x87\x80\x80\x80\x00\x00\x20\x00\x40\x00\x1a\x0b");

// memory_size.wast:53
assert_return(() => call($4, "size", []), 3);

// memory_size.wast:54
assert_return(() => call($4, "grow", [1]));

// memory_size.wast:55
assert_return(() => call($4, "size", []), 4);

// memory_size.wast:56
assert_return(() => call($4, "grow", [3]));

// memory_size.wast:57
assert_return(() => call($4, "size", []), 7);

// memory_size.wast:58
assert_return(() => call($4, "grow", [0]));

// memory_size.wast:59
assert_return(() => call($4, "size", []), 7);

// memory_size.wast:60
assert_return(() => call($4, "grow", [2]));

// memory_size.wast:61
assert_return(() => call($4, "size", []), 7);

// memory_size.wast:62
assert_return(() => call($4, "grow", [1]));

// memory_size.wast:63
assert_return(() => call($4, "size", []), 8);

// memory_size.wast:68
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x05\x83\x80\x80\x80\x00\x01\x00\x01\x0a\x8a\x80\x80\x80\x00\x01\x84\x80\x80\x80\x00\x00\x3f\x00\x0b");

// memory_size.wast:77
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x00\x01\x7d\x03\x82\x80\x80\x80\x00\x01\x00\x05\x83\x80\x80\x80\x00\x01\x00\x01\x0a\x8a\x80\x80\x80\x00\x01\x84\x80\x80\x80\x00\x00\x3f\x00\x0b");
