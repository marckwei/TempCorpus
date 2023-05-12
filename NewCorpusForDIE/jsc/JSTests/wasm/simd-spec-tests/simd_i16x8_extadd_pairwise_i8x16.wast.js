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


// simd_i16x8_extadd_pairwise_i8x16.wast:4
let $1 = instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x86\x80\x80\x80\x00\x01\x60\x01\x7b\x01\x7b\x03\x83\x80\x80\x80\x00\x02\x00\x00\x07\xc1\x80\x80\x80\x00\x02\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x73\x00\x00\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x75\x00\x01\x0a\x97\x80\x80\x80\x00\x02\x86\x80\x80\x80\x00\x00\x20\x00\xfd\x7c\x0b\x86\x80\x80\x80\x00\x00\x20\x00\xfd\x7d\x0b");

// simd_i16x8_extadd_pairwise_i8x16.wast:11
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x73\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_s", [v128("0 0 0 0")]), v128("0 0 0 0 0 0 0 0"))

// simd_i16x8_extadd_pairwise_i8x16.wast:13
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x73\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\x02\x00\x02\x00\x02\x00\x02\x00\x02\x00\x02\x00\x02\x00\x02\x00\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_s", [v128("16_843_009 16_843_009 16_843_009 16_843_009")]), v128("2 2 2 2 2 2 2 2"))

// simd_i16x8_extadd_pairwise_i8x16.wast:15
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x73\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\xfe\xff\xfe\xff\xfe\xff\xfe\xff\xfe\xff\xfe\xff\xfe\xff\xfe\xff\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_s", [v128("-1 -1 -1 -1")]), v128("-2 -2 -2 -2 -2 -2 -2 -2"))

// simd_i16x8_extadd_pairwise_i8x16.wast:17
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x73\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\xfc\x00\xfc\x00\xfc\x00\xfc\x00\xfc\x00\xfc\x00\xfc\x00\xfc\x00\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_s", [v128("2_122_219_134 2_122_219_134 2_122_219_134 2_122_219_134")]), v128("252 252 252 252 252 252 252 252"))

// simd_i16x8_extadd_pairwise_i8x16.wast:19
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x73\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\x81\x81\x81\x81\x81\x81\x81\x81\x81\x81\x81\x81\x81\x81\x81\x81\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\x02\xff\x02\xff\x02\xff\x02\xff\x02\xff\x02\xff\x02\xff\x02\xff\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_s", [v128("-2_122_219_135 -2_122_219_135 -2_122_219_135 -2_122_219_135")]), v128("-254 -254 -254 -254 -254 -254 -254 -254"))

// simd_i16x8_extadd_pairwise_i8x16.wast:21
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x73\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\x80\x80\x80\x80\x80\x80\x80\x80\x80\x80\x80\x80\x80\x80\x80\x80\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\x00\xff\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_s", [v128("-2_139_062_144 -2_139_062_144 -2_139_062_144 -2_139_062_144")]), v128("-256 -256 -256 -256 -256 -256 -256 -256"))

// simd_i16x8_extadd_pairwise_i8x16.wast:23
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x73\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\xfe\x00\xfe\x00\xfe\x00\xfe\x00\xfe\x00\xfe\x00\xfe\x00\xfe\x00\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_s", [v128("2_139_062_143 2_139_062_143 2_139_062_143 2_139_062_143")]), v128("254 254 254 254 254 254 254 254"))

// simd_i16x8_extadd_pairwise_i8x16.wast:25
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x73\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\xfe\xff\xfe\xff\xfe\xff\xfe\xff\xfe\xff\xfe\xff\xfe\xff\xfe\xff\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_s", [v128("-1 -1 -1 -1")]), v128("-2 -2 -2 -2 -2 -2 -2 -2"))

// simd_i16x8_extadd_pairwise_i8x16.wast:29
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x75\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_u", [v128("0 0 0 0")]), v128("0 0 0 0 0 0 0 0"))

// simd_i16x8_extadd_pairwise_i8x16.wast:31
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x75\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x01\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\x02\x00\x02\x00\x02\x00\x02\x00\x02\x00\x02\x00\x02\x00\x02\x00\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_u", [v128("16_843_009 16_843_009 16_843_009 16_843_009")]), v128("2 2 2 2 2 2 2 2"))

// simd_i16x8_extadd_pairwise_i8x16.wast:33
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x75\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\xfe\x01\xfe\x01\xfe\x01\xfe\x01\xfe\x01\xfe\x01\xfe\x01\xfe\x01\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_u", [v128("-1 -1 -1 -1")]), v128("510 510 510 510 510 510 510 510"))

// simd_i16x8_extadd_pairwise_i8x16.wast:35
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x75\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x7e\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\xfc\x00\xfc\x00\xfc\x00\xfc\x00\xfc\x00\xfc\x00\xfc\x00\xfc\x00\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_u", [v128("2_122_219_134 2_122_219_134 2_122_219_134 2_122_219_134")]), v128("252 252 252 252 252 252 252 252"))

// simd_i16x8_extadd_pairwise_i8x16.wast:37
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x75\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\x81\x81\x81\x81\x81\x81\x81\x81\x81\x81\x81\x81\x81\x81\x81\x81\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\x02\x01\x02\x01\x02\x01\x02\x01\x02\x01\x02\x01\x02\x01\x02\x01\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_u", [v128("-2_122_219_135 -2_122_219_135 -2_122_219_135 -2_122_219_135")]), v128("258 258 258 258 258 258 258 258"))

// simd_i16x8_extadd_pairwise_i8x16.wast:39
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x75\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\x80\x80\x80\x80\x80\x80\x80\x80\x80\x80\x80\x80\x80\x80\x80\x80\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\x00\x01\x00\x01\x00\x01\x00\x01\x00\x01\x00\x01\x00\x01\x00\x01\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_u", [v128("-2_139_062_144 -2_139_062_144 -2_139_062_144 -2_139_062_144")]), v128("256 256 256 256 256 256 256 256"))

// simd_i16x8_extadd_pairwise_i8x16.wast:41
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x75\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x7f\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\xfe\x00\xfe\x00\xfe\x00\xfe\x00\xfe\x00\xfe\x00\xfe\x00\xfe\x00\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_u", [v128("2_139_062_143 2_139_062_143 2_139_062_143 2_139_062_143")]), v128("254 254 254 254 254 254 254 254"))

// simd_i16x8_extadd_pairwise_i8x16.wast:43
run(() => call(instance("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\xa4\x80\x80\x80\x00\x07\x60\x00\x00\x60\x01\x7f\x01\x6f\x60\x01\x6f\x01\x7f\x60\x01\x70\x01\x7f\x60\x02\x6f\x6f\x01\x7f\x60\x02\x70\x70\x01\x7f\x60\x01\x7b\x01\x7b\x02\x99\x81\x80\x80\x00\x06\x06\x6d\x6f\x64\x75\x6c\x65\x1d\x69\x31\x36\x78\x38\x2e\x65\x78\x74\x61\x64\x64\x5f\x70\x61\x69\x72\x77\x69\x73\x65\x5f\x69\x38\x78\x31\x36\x5f\x75\x00\x06\x08\x73\x70\x65\x63\x74\x65\x73\x74\x09\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x01\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x69\x73\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x02\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x69\x73\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x03\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0c\x65\x71\x5f\x65\x78\x74\x65\x72\x6e\x72\x65\x66\x00\x04\x08\x73\x70\x65\x63\x74\x65\x73\x74\x0a\x65\x71\x5f\x66\x75\x6e\x63\x72\x65\x66\x00\x05\x03\x82\x80\x80\x80\x00\x01\x00\x07\x87\x80\x80\x80\x00\x01\x03\x72\x75\x6e\x00\x06\x0a\xce\x80\x80\x80\x00\x01\xc8\x80\x80\x80\x00\x00\x02\x40\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\x10\x00\xfd\x0c\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xfd\x4e\xfd\x0c\xfe\x01\xfe\x01\xfe\x01\xfe\x01\xfe\x01\xfe\x01\xfe\x01\xfe\x01\xfd\x23\xfd\x63\x45\x0d\x00\x0f\x0b\x00\x0b", exports($1)),  "run", []));  // assert_return(() => call($1, "i16x8.extadd_pairwise_i8x16_u", [v128("-1 -1 -1 -1")]), v128("510 510 510 510 510 510 510 510"))

// simd_i16x8_extadd_pairwise_i8x16.wast:47
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x00\x01\x7b\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8c\x80\x80\x80\x00\x01\x86\x80\x80\x80\x00\x00\x41\x00\xfd\x7c\x0b");

// simd_i16x8_extadd_pairwise_i8x16.wast:48
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x00\x01\x7b\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8c\x80\x80\x80\x00\x01\x86\x80\x80\x80\x00\x00\x41\x00\xfd\x7d\x0b");

// simd_i16x8_extadd_pairwise_i8x16.wast:52
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x00\x01\x7b\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8a\x80\x80\x80\x00\x01\x84\x80\x80\x80\x00\x00\xfd\x7c\x0b");

// simd_i16x8_extadd_pairwise_i8x16.wast:60
assert_invalid("\x00\x61\x73\x6d\x01\x00\x00\x00\x01\x85\x80\x80\x80\x00\x01\x60\x00\x01\x7b\x03\x82\x80\x80\x80\x00\x01\x00\x0a\x8a\x80\x80\x80\x00\x01\x84\x80\x80\x80\x00\x00\xfd\x7d\x0b");