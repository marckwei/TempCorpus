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

//@ skip if !$isWasmPlatform
//@ skip if $memoryLimited
//@ runDefault("--maximumWasmDepthForInlining=10", "--maximumWasmCalleeSizeForInlining=10000000", "--maximumWasmCallerSizeForInlining=10000000", "--useBBQJIT=0")
var wasm_code = read('simple-inline-stacktrace.wasm', 'binary')
var wasm_module = new WebAssembly.Module(wasm_code);
var wasm_instance = new WebAssembly.Instance(wasm_module, { a: { doThrow: () => { throw new Error() } } });
var f = wasm_instance.exports.main;
for (let i = 0; i < 10000; ++i) {
    try {
        f()
    } catch (e) {
        let str = e.stack.toString()
        let trace = str.split('\n')
        let expected = ["*", "<?>.wasm-function[g]@[wasm code]",
        "<?>.wasm-function[f]@[wasm code]", "<?>.wasm-function[e]@[wasm code]", "<?>.wasm-function[d]@[wasm code]",
        "<?>.wasm-function[c]@[wasm code]", "<?>.wasm-function[b]@[wasm code]", "<?>.wasm-function[a]@[wasm code]",
        "<?>.wasm-function[main]@[wasm code]", "*"]
        if (trace.length != expected.length)
            throw "unexpected length"
        for (let i = 0; i < trace.length; ++i) {
            if (expected[i] == "*")
                continue
            if (expected[i] != trace[i].trim())
                throw "mismatch at " + i
        }
    }
}

let mem = new Int32Array(wasm_instance.exports.mem.buffer)[0]
if (mem != 10000)
    throw "Expected 10000, got " + mem
