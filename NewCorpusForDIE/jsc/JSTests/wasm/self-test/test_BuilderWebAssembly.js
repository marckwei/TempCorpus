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

import * as assert from '../assert.js';
import Builder from '../Builder.js';

(function EmptyModule() {
    const builder = new Builder();
    const bin = builder.WebAssembly();
    assert.eq(bin.hexdump().trim(),
              "00000000 00 61 73 6d 01 00 00 00                          |·asm····        |");
})();

(function EmptyModule() {
    const bin = (new Builder())
          .setPreamble({ "magic number": 0x45464F43, version: 0xFFFFFFFF })
          .WebAssembly();
    assert.eq(bin.hexdump().trim(),
              "00000000 43 4f 46 45 ff ff ff ff                          |COFE····        |");
})();

(function CustomSection() {
    const bin = (new Builder())
        .Unknown("OHHAI")
            .Byte(0xDE)
            .Byte(0xAD)
            .Byte(0xC0)
            .Byte(0xFE)
        .End()
        .WebAssembly();
    assert.eq(bin.hexdump().trim(),
              ["00000000 00 61 73 6d 01 00 00 00 00 0a 05 4f 48 48 41 49  |·asm·······OHHAI|",
               "00000010 de ad c0 fe                                      |····            |"].join("\n"));
})();
