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

// memory.wast:3
let $1 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x83\x80\x80\x80\x00\x01\x00\x00");

// memory.wast:4
let $2 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x83\x80\x80\x80\x00\x01\x00\x01");

// memory.wast:5
let $3 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x84\x80\x80\x80\x00\x01\x01\x00\x00");

// memory.wast:6
let $4 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x84\x80\x80\x80\x00\x01\x01\x00\x01");

// memory.wast:7
let $5 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x85\x80\x80\x80\x00\x01\x01\x01\x80\x02");

// memory.wast:8
let $6 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x86\x80\x80\x80\x00\x01\x01\x00\x80\x80\x04");

// memory.wast:9
let $7 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x84\x80\x80\x80\x00\x01\x03\x00\x00");

// memory.wast:10
let $8 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x84\x80\x80\x80\x00\x01\x03\x01\x02");

// memory.wast:12
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x83\x80\x80\x80\x00\x01\x02\x01");

// memory.wast:14
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x85\x80\x80\x80\x00\x02\x00\x00\x00\x00");

// memory.wast:15
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x02\x94\x80\x80\x80\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x06\x6d\x65\x6d\x6f\x72\x79\x02\x00\x00\x05\x83\x80\x80\x80\x00\x01\x00\x00");

// memory.wast:17
let $9 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x00\x01\x7f\x03\x82\x80\x80\x80\x00\x01\x00\x05\x84\x80\x80\x80\x00\x01\x01\x00\x00\x07\x8b\x80\x80\x80\x00\x01\x07\x6d\x65\x6d\x73\x69\x7a\x65\x00\x00\x0a\x8a\x80\x80\x80\x00\x01\x84\x80\x80\x80\x00\x00\x3f\x00\x0b\x0b\x86\x80\x80\x80\x00\x01\x00\x41\x00\x0b\x00");

// memory.wast:18
assert_return(() => call($9, "memsize", []), 0);

// memory.wast:19
let $10 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x00\x01\x7f\x03\x82\x80\x80\x80\x00\x01\x00\x05\x84\x80\x80\x80\x00\x01\x01\x00\x00\x07\x8b\x80\x80\x80\x00\x01\x07\x6d\x65\x6d\x73\x69\x7a\x65\x00\x00\x0a\x8a\x80\x80\x80\x00\x01\x84\x80\x80\x80\x00\x00\x3f\x00\x0b\x0b\x86\x80\x80\x80\x00\x01\x00\x41\x00\x0b\x00");

// memory.wast:20
assert_return(() => call($10, "memsize", []), 0);

// memory.wast:21
let $11 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x00\x01\x7f\x03\x82\x80\x80\x80\x00\x01\x00\x05\x84\x80\x80\x80\x00\x01\x01\x01\x01\x07\x8b\x80\x80\x80\x00\x01\x07\x6d\x65\x6d\x73\x69\x7a\x65\x00\x00\x0a\x8a\x80\x80\x80\x00\x01\x84\x80\x80\x80\x00\x00\x3f\x00\x0b\x0b\x87\x80\x80\x80\x00\x01\x00\x41\x00\x0b\x01\x78");

// memory.wast:22
assert_return(() => call($11, "memsize", []), 1);

// memory.wast:24
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x0b\x86\x80\x80\x80\x00\x01\x00\x41\x00\x0b\x00");

// memory.wast:25
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x0b\x86\x80\x80\x80\x00\x01\x00\x41\x00\x0b\x00");

// memory.wast:26
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x0b\x87\x80\x80\x80\x00\x01\x00\x41\x00\x0b\x01\x78");

// memory.wast:28
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8e\x80\x80\x80\x00\x01\x88\x80\x80\x80\x00\x00\x41\x00\x2a\x02\x00\x1a\x0b");

// memory.wast:32
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x92\x80\x80\x80\x00\x01\x8c\x80\x80\x80\x00\x00\x41\x00\x43\x00\x00\x00\x00\x38\x02\x00\x0b");

// memory.wast:36
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8e\x80\x80\x80\x00\x01\x88\x80\x80\x80\x00\x00\x41\x00\x2c\x00\x00\x1a\x0b");

// memory.wast:40
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8f\x80\x80\x80\x00\x01\x89\x80\x80\x80\x00\x00\x41\x00\x41\x00\x3a\x00\x00\x0b");

// memory.wast:44
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8b\x80\x80\x80\x00\x01\x85\x80\x80\x80\x00\x00\x3f\x00\x1a\x0b");

// memory.wast:48
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x84\x80\x80\x80\x00\x01\x60\x00\x00\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8d\x80\x80\x80\x00\x01\x87\x80\x80\x80\x00\x00\x41\x00\x40\x00\x1a\x0b");

// memory.wast:54
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x84\x80\x80\x80\x00\x01\x01\x01\x00");

// memory.wast:58
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x85\x80\x80\x80\x00\x01\x00\x81\x80\x04");

// memory.wast:62
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x87\x80\x80\x80\x00\x01\x00\x80\x80\x80\x80\x08");

// memory.wast:66
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x87\x80\x80\x80\x00\x01\x00\xff\xff\xff\xff\x0f");

// memory.wast:70
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x86\x80\x80\x80\x00\x01\x01\x00\x81\x80\x04");

// memory.wast:74
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x88\x80\x80\x80\x00\x01\x01\x00\x80\x80\x80\x80\x08");

// memory.wast:78
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x05\x88\x80\x80\x80\x00\x01\x01\x00\xff\xff\xff\xff\x0f");

// memory.wast:83
assert_malformed("\x3c\x6d\x61\x6c\x66\x6f\x72\x6d\x65\x64\x20\x71\x75\x6f\x74\x65\x3e");

// memory.wast:87
assert_malformed("\x3c\x6d\x61\x6c\x66\x6f\x72\x6d\x65\x64\x20\x71\x75\x6f\x74\x65\x3e");

// memory.wast:91
assert_malformed("\x3c\x6d\x61\x6c\x66\x6f\x72\x6d\x65\x64\x20\x71\x75\x6f\x74\x65\x3e");

// memory.wast:96
let $12 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x93\x80\x80\x80\x00\x04\x60\x00\x01\x7f\x60\x00\x01\x7c\x60\x01\x7f\x01\x7f\x60\x01\x7e\x01\x7e\x03\x8d\x80\x80\x80\x00\x0c\x00\x01\x02\x02\x02\x02\x03\x03\x03\x03\x03\x03\x05\x83\x80\x80\x80\x00\x01\x00\x01\x07\xa1\x81\x80\x80\x00\x0c\x04\x64\x61\x74\x61\x00\x00\x04\x63\x61\x73\x74\x00\x01\x0b\x69\x33\x32\x5f\x6c\x6f\x61\x64\x38\x5f\x73\x00\x02\x0b\x69\x33\x32\x5f\x6c\x6f\x61\x64\x38\x5f\x75\x00\x03\x0c\x69\x33\x32\x5f\x6c\x6f\x61\x64\x31\x36\x5f\x73\x00\x04\x0c\x69\x33\x32\x5f\x6c\x6f\x61\x64\x31\x36\x5f\x75\x00\x05\x0b\x69\x36\x34\x5f\x6c\x6f\x61\x64\x38\x5f\x73\x00\x06\x0b\x69\x36\x34\x5f\x6c\x6f\x61\x64\x38\x5f\x75\x00\x07\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x31\x36\x5f\x73\x00\x08\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x31\x36\x5f\x75\x00\x09\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x33\x32\x5f\x73\x00\x0a\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x33\x32\x5f\x75\x00\x0b\x0a\xcf\x82\x80\x80\x00\x0c\xce\x80\x80\x80\x00\x00\x41\x00\x2d\x00\x00\x41\xc1\x00\x46\x41\x03\x2d\x00\x00\x41\xa7\x01\x46\x71\x41\x06\x2d\x00\x00\x41\x00\x46\x41\x13\x2d\x00\x00\x41\x00\x46\x71\x71\x41\x14\x2d\x00\x00\x41\xd7\x00\x46\x41\x17\x2d\x00\x00\x41\xcd\x00\x46\x71\x41\x18\x2d\x00\x00\x41\x00\x46\x41\xff\x07\x2d\x00\x00\x41\x00\x46\x71\x71\x71\x0b\xb8\x80\x80\x80\x00\x00\x41\x08\x42\xc7\x9f\x7f\x37\x03\x00\x41\x08\x2b\x03\x00\x42\xc7\x9f\x7f\xbf\x61\x04\x40\x44\x00\x00\x00\x00\x00\x00\x00\x00\x0f\x0b\x41\x09\x42\x00\x37\x00\x00\x41\x0f\x41\xc5\x80\x01\x3b\x00\x00\x41\x09\x2b\x00\x00\x0b\x8e\x80\x80\x80\x00\x00\x41\x08\x20\x00\x3a\x00\x00\x41\x08\x2c\x00\x00\x0b\x8e\x80\x80\x80\x00\x00\x41\x08\x20\x00\x3a\x00\x00\x41\x08\x2d\x00\x00\x0b\x8e\x80\x80\x80\x00\x00\x41\x08\x20\x00\x3b\x01\x00\x41\x08\x2e\x01\x00\x0b\x8e\x80\x80\x80\x00\x00\x41\x08\x20\x00\x3b\x01\x00\x41\x08\x2f\x01\x00\x0b\x8e\x80\x80\x80\x00\x00\x41\x08\x20\x00\x3c\x00\x00\x41\x08\x30\x00\x00\x0b\x8e\x80\x80\x80\x00\x00\x41\x08\x20\x00\x3c\x00\x00\x41\x08\x31\x00\x00\x0b\x8e\x80\x80\x80\x00\x00\x41\x08\x20\x00\x3d\x01\x00\x41\x08\x32\x01\x00\x0b\x8e\x80\x80\x80\x00\x00\x41\x08\x20\x00\x3d\x01\x00\x41\x08\x33\x01\x00\x0b\x8e\x80\x80\x80\x00\x00\x41\x08\x20\x00\x3e\x02\x00\x41\x08\x34\x02\x00\x0b\x8e\x80\x80\x80\x00\x00\x41\x08\x20\x00\x3e\x02\x00\x41\x08\x35\x02\x00\x0b\x0b\x94\x80\x80\x80\x00\x02\x00\x41\x00\x0b\x05\x41\x42\x43\xa7\x44\x00\x41\x14\x0b\x04\x57\x41\x53\x4d");

// memory.wast:184
assert_return(() => call($12, "data", []), 1);

// memory.wast:185
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x88\x80\x80\x80\x00\x02\x60\x00\x00\x60\x00\x01\x7c\x02\x8c\x80\x80\x80\x00\x01\x03\x24\x31\x32\x04\x63\x61\x73\x74\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x9e\x80\x80\x80\x00\x01\x98\x80\x80\x80\x00\x00\x02\x40\x10\x00\xbd\x44\x00\x00\x00\x00\x00\x00\x45\x40\xbd\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "cast", []), 42.)

// memory.wast:187
assert_return(() => call($12, "i32_load8_s", [-1]), -1);

// memory.wast:188
assert_return(() => call($12, "i32_load8_u", [-1]), 255);

// memory.wast:189
assert_return(() => call($12, "i32_load16_s", [-1]), -1);

// memory.wast:190
assert_return(() => call($12, "i32_load16_u", [-1]), 65_535);

// memory.wast:192
assert_return(() => call($12, "i32_load8_s", [100]), 100);

// memory.wast:193
assert_return(() => call($12, "i32_load8_u", [200]), 200);

// memory.wast:194
assert_return(() => call($12, "i32_load16_s", [20_000]), 20_000);

// memory.wast:195
assert_return(() => call($12, "i32_load16_u", [40_000]), 40_000);

// memory.wast:197
assert_return(() => call($12, "i32_load8_s", [-19_110_589]), 67);

// memory.wast:198
assert_return(() => call($12, "i32_load8_s", [878_104_047]), -17);

// memory.wast:199
assert_return(() => call($12, "i32_load8_u", [-19_110_589]), 67);

// memory.wast:200
assert_return(() => call($12, "i32_load8_u", [878_104_047]), 239);

// memory.wast:201
assert_return(() => call($12, "i32_load16_s", [-19_110_589]), 25_923);

// memory.wast:202
assert_return(() => call($12, "i32_load16_s", [878_104_047]), -12_817);

// memory.wast:203
assert_return(() => call($12, "i32_load16_u", [-19_110_589]), 25_923);

// memory.wast:204
assert_return(() => call($12, "i32_load16_u", [878_104_047]), 52_719);

// memory.wast:206
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x93\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0b\x69\x36\x34\x5f\x6c\x6f\x61\x64\x38\x5f\x73\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x99\x80\x80\x80\x00\x01\x93\x80\x80\x80\x00\x00\x02\x40\x42\x7f\x10\x00\x01\x42\x7f\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load8_s", [int64("-1")]), int64("-1"))

// memory.wast:207
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x93\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0b\x69\x36\x34\x5f\x6c\x6f\x61\x64\x38\x5f\x75\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x9a\x80\x80\x80\x00\x01\x94\x80\x80\x80\x00\x00\x02\x40\x42\x7f\x10\x00\x01\x42\xff\x01\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load8_u", [int64("-1")]), int64("255"))

// memory.wast:208
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x31\x36\x5f\x73\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x99\x80\x80\x80\x00\x01\x93\x80\x80\x80\x00\x00\x02\x40\x42\x7f\x10\x00\x01\x42\x7f\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load16_s", [int64("-1")]), int64("-1"))

// memory.wast:209
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x31\x36\x5f\x75\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x9b\x80\x80\x80\x00\x01\x95\x80\x80\x80\x00\x00\x02\x40\x42\x7f\x10\x00\x01\x42\xff\xff\x03\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load16_u", [int64("-1")]), int64("65_535"))

// memory.wast:210
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x33\x32\x5f\x73\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x99\x80\x80\x80\x00\x01\x93\x80\x80\x80\x00\x00\x02\x40\x42\x7f\x10\x00\x01\x42\x7f\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load32_s", [int64("-1")]), int64("-1"))

// memory.wast:211
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x33\x32\x5f\x75\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x9d\x80\x80\x80\x00\x01\x97\x80\x80\x80\x00\x00\x02\x40\x42\x7f\x10\x00\x01\x42\xff\xff\xff\xff\x0f\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load32_u", [int64("-1")]), int64("4_294_967_295"))

// memory.wast:213
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x93\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0b\x69\x36\x34\x5f\x6c\x6f\x61\x64\x38\x5f\x73\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x9b\x80\x80\x80\x00\x01\x95\x80\x80\x80\x00\x00\x02\x40\x42\xe4\x00\x10\x00\x01\x42\xe4\x00\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load8_s", [int64("100")]), int64("100"))

// memory.wast:214
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x93\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0b\x69\x36\x34\x5f\x6c\x6f\x61\x64\x38\x5f\x75\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x9b\x80\x80\x80\x00\x01\x95\x80\x80\x80\x00\x00\x02\x40\x42\xc8\x01\x10\x00\x01\x42\xc8\x01\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load8_u", [int64("200")]), int64("200"))

// memory.wast:215
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x31\x36\x5f\x73\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x9d\x80\x80\x80\x00\x01\x97\x80\x80\x80\x00\x00\x02\x40\x42\xa0\x9c\x01\x10\x00\x01\x42\xa0\x9c\x01\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load16_s", [int64("20_000")]), int64("20_000"))

// memory.wast:216
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x31\x36\x5f\x75\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x9d\x80\x80\x80\x00\x01\x97\x80\x80\x80\x00\x00\x02\x40\x42\xc0\xb8\x02\x10\x00\x01\x42\xc0\xb8\x02\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load16_u", [int64("40_000")]), int64("40_000"))

// memory.wast:217
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x33\x32\x5f\x73\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x9d\x80\x80\x80\x00\x01\x97\x80\x80\x80\x00\x00\x02\x40\x42\xa0\x9c\x01\x10\x00\x01\x42\xa0\x9c\x01\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load32_s", [int64("20_000")]), int64("20_000"))

// memory.wast:218
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x33\x32\x5f\x75\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\x9d\x80\x80\x80\x00\x01\x97\x80\x80\x80\x00\x00\x02\x40\x42\xc0\xb8\x02\x10\x00\x01\x42\xc0\xb8\x02\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load32_u", [int64("40_000")]), int64("40_000"))

// memory.wast:220
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x93\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0b\x69\x36\x34\x5f\x6c\x6f\x61\x64\x38\x5f\x73\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa2\x80\x80\x80\x00\x01\x9c\x80\x80\x80\x00\x00\x02\x40\x42\xc3\xca\xd1\xb1\x85\xd3\xae\xee\x7e\x10\x00\x01\x42\xc3\x00\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load8_s", [int64("-81_985_529_755_441_853")]), int64("67"))

// memory.wast:221
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x93\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0b\x69\x36\x34\x5f\x6c\x6f\x61\x64\x38\x5f\x73\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa1\x80\x80\x80\x00\x01\x9b\x80\x80\x80\x00\x00\x02\x40\x42\xef\x9b\xeb\xc5\xd9\xec\x90\xab\x34\x10\x00\x01\x42\x6f\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load8_s", [int64("3_771_275_841_602_506_223")]), int64("-17"))

// memory.wast:222
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x93\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0b\x69\x36\x34\x5f\x6c\x6f\x61\x64\x38\x5f\x75\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa2\x80\x80\x80\x00\x01\x9c\x80\x80\x80\x00\x00\x02\x40\x42\xc3\xca\xd1\xb1\x85\xd3\xae\xee\x7e\x10\x00\x01\x42\xc3\x00\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load8_u", [int64("-81_985_529_755_441_853")]), int64("67"))

// memory.wast:223
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x93\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0b\x69\x36\x34\x5f\x6c\x6f\x61\x64\x38\x5f\x75\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa2\x80\x80\x80\x00\x01\x9c\x80\x80\x80\x00\x00\x02\x40\x42\xef\x9b\xeb\xc5\xd9\xec\x90\xab\x34\x10\x00\x01\x42\xef\x01\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load8_u", [int64("3_771_275_841_602_506_223")]), int64("239"))

// memory.wast:224
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x31\x36\x5f\x73\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa3\x80\x80\x80\x00\x01\x9d\x80\x80\x80\x00\x00\x02\x40\x42\xc3\xca\xd1\xb1\x85\xd3\xae\xee\x7e\x10\x00\x01\x42\xc3\xca\x01\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load16_s", [int64("-81_985_529_755_441_853")]), int64("25_923"))

// memory.wast:225
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x31\x36\x5f\x73\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa3\x80\x80\x80\x00\x01\x9d\x80\x80\x80\x00\x00\x02\x40\x42\xef\x9b\xeb\xc5\xd9\xec\x90\xab\x34\x10\x00\x01\x42\xef\x9b\x7f\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load16_s", [int64("3_771_275_841_602_506_223")]), int64("-12_817"))

// memory.wast:226
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x31\x36\x5f\x75\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa3\x80\x80\x80\x00\x01\x9d\x80\x80\x80\x00\x00\x02\x40\x42\xc3\xca\xd1\xb1\x85\xd3\xae\xee\x7e\x10\x00\x01\x42\xc3\xca\x01\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load16_u", [int64("-81_985_529_755_441_853")]), int64("25_923"))

// memory.wast:227
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x31\x36\x5f\x75\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa3\x80\x80\x80\x00\x01\x9d\x80\x80\x80\x00\x00\x02\x40\x42\xef\x9b\xeb\xc5\xd9\xec\x90\xab\x34\x10\x00\x01\x42\xef\x9b\x03\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load16_u", [int64("3_771_275_841_602_506_223")]), int64("52_719"))

// memory.wast:228
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x33\x32\x5f\x73\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa5\x80\x80\x80\x00\x01\x9f\x80\x80\x80\x00\x00\x02\x40\x42\xc3\xca\xd1\xb1\x85\xd3\xae\xee\x7e\x10\x00\x01\x42\xc3\xca\xd1\xb1\x05\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load32_s", [int64("-81_985_529_755_441_853")]), int64("1_446_274_371"))

// memory.wast:229
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x33\x32\x5f\x73\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa5\x80\x80\x80\x00\x01\x9f\x80\x80\x80\x00\x00\x02\x40\x42\xef\x9b\xeb\xc5\xd9\xec\x90\xab\x34\x10\x00\x01\x42\xef\x9b\xeb\xc5\x79\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load32_s", [int64("3_771_275_841_602_506_223")]), int64("-1_732_588_049"))

// memory.wast:230
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x33\x32\x5f\x75\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa5\x80\x80\x80\x00\x01\x9f\x80\x80\x80\x00\x00\x02\x40\x42\xc3\xca\xd1\xb1\x85\xd3\xae\xee\x7e\x10\x00\x01\x42\xc3\xca\xd1\xb1\x05\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load32_u", [int64("-81_985_529_755_441_853")]), int64("1_446_274_371"))

// memory.wast:231
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x89\x80\x80\x80\x00\x02\x60\x00\x00\x60\x01\x7e\x01\x7e\x02\x94\x80\x80\x80\x00\x01\x03\x24\x31\x32\x0c\x69\x36\x34\x5f\x6c\x6f\x61\x64\x33\x32\x5f\x75\x00\x01\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x01\x0a\xa5\x80\x80\x80\x00\x01\x9f\x80\x80\x80\x00\x00\x02\x40\x42\xef\x9b\xeb\xc5\xd9\xec\x90\xab\x34\x10\x00\x01\x42\xef\x9b\xeb\xc5\x09\x01\x51\x45\x0d\x00\x0f\x0b\x00\x0b", exports("$12", $12)),  "run", []));  // assert_return(() => call($12, "i64_load32_u", [int64("3_771_275_841_602_506_223")]), int64("2_562_379_247"))

// memory.wast:235
assert_malformed("\x3c\x6d\x61\x6c\x66\x6f\x72\x6d\x65\x64\x20\x71\x75\x6f\x74\x65\x3e");

// memory.wast:239
assert_malformed("\x3c\x6d\x61\x6c\x66\x6f\x72\x6d\x65\x64\x20\x71\x75\x6f\x74\x65\x3e");

// memory.wast:243
assert_malformed("\x3c\x6d\x61\x6c\x66\x6f\x72\x6d\x65\x64\x20\x71\x75\x6f\x74\x65\x3e");
