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

// From oss-fuzz: https://bugs.chromium.org/p/oss-fuzz/issues/detail?id=17976

var kWasmH0 = 0;
var kWasmH1 = 0x61;
var kWasmH2 = 0x73;
var kWasmH3 = 0x6d;
var kWasmV0 = 0x1;
var kWasmV1 = 0;
var kWasmV2 = 0;
var kWasmV3 = 0;
let kTypeSectionCode = 1;
let kFunctionSectionCode = 3;
let kCodeSectionCode = 10;
let kWasmFunctionTypeForm = 0x60;
class Binary {
  constructor() {
    this.length = 0;
    this.buffer = new Uint8Array(8192);
  }
  trunc_buffer() {
    return new Uint8Array(this.buffer.buffer, 0, this.length);
  }
  emit_leb_u() {

        this.buffer[this.length++] = v;
        return;
  }
  emit_u32v() {
    this.emit_leb_u();
  }
  emit_bytes(data) {
    this.buffer.set(data, this.length);
    this.length += data.length;
  }
  emit_header() {
    this.emit_bytes([kWasmH0, kWasmH1, kWasmH2, kWasmH3, kWasmV0, kWasmV1, kWasmV2, kWasmV3]);
  }

}
function __f_576(__v_2078) {
    WebAssembly.compile(__v_2078.trunc_buffer())
}
  (function __f_587() {
    let __v_2099 = new Binary();

      __v_2099.emit_header()
      __v_2099.emit_bytes([kTypeSectionCode, 4, 1, kWasmFunctionTypeForm, 0, 0])
      __v_2099.emit_bytes([kFunctionSectionCode, 2, 1, 0])
      __v_2099.emit_bytes([kCodeSectionCode, 20, 1])
    try {
      __v_2099.emit_u32v();
    } catch (e) {}
      __f_576(__v_2099,
 'testBodySizeIsZero')
  })();
