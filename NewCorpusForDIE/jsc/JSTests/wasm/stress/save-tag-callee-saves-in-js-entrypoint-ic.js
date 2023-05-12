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

/*
(module
 (type $none_=>_i32 (func (result i32)))
 (export "test" (func $0))
 (func $0 (result i32)
  (i32.const 1234)
 )
)
*/

const wasm = new Uint8Array([
    0x00,0x61,0x73,0x6d,0x01,0x00,0x00,0x00,0x01,0x05,0x01,0x60,0x00,0x01,0x7f,0x03,
    0x02,0x01,0x00,0x07,0x08,0x01,0x04,0x74,0x65,0x73,0x74,0x00,0x00,0x0a,0x07,0x01,
    0x05,0x00,0x41,0xd2,0x09,0x0b
])

// We should not crash.

WebAssembly.instantiate(wasm).then(e => {
    const mod = e.instance.exports

    class Test {
        get breakIt() {
            return mod.test()
        }
    }

    const obj = new Test()

    for (let i = 1; i < 24; i++) {
        const iterCount = 1 << i
        for (let j = 0; j < iterCount; j++) {
            obj.breakIt
        }
    }
});
