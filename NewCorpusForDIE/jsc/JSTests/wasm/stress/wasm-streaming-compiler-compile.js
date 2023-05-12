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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

function slice(array, step, func) {
    for (let index = 0; index < array.length; index += step)
        func(array.slice(index, index + step));
}

async function main() {
    try {
        await $vm.createWasmStreamingCompilerForCompile(function (compiler) {
        });
    } catch (error) {
        shouldBe(error instanceof WebAssembly.CompileError, true);
    }

    {
        let wasmBuffer = readFile("./resources/tsf.wasm", "binary");
        await $vm.createWasmStreamingCompilerForCompile(function (compiler) {
            slice(wasmBuffer, 100, (buffer) => compiler.addBytes(buffer));
        });
        await $vm.createWasmStreamingCompilerForCompile(function (compiler) {
            slice(wasmBuffer, 1000, (buffer) => compiler.addBytes(buffer));
        });
    }
}

main().catch(function (error) {
    print(String(error));
    print(String(error.stack));
    $vm.abort()
});
