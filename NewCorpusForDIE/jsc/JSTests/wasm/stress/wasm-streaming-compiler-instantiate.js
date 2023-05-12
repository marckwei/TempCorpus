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
        await $vm.createWasmStreamingCompilerForInstantiate(function (compiler) {
        });
    } catch (error) {
        shouldBe(error instanceof WebAssembly.CompileError, true);
    }

    {
        let wasmBuffer = readFile("./nameSection.wasm", "binary");
        await $vm.createWasmStreamingCompilerForInstantiate(function (compiler) {
            slice(wasmBuffer, 10, (buffer) => compiler.addBytes(buffer));
        }, {
            env: {
                memory: new WebAssembly.Memory({ initial: 256, maximum: 256  }),
                DYNAMICTOP_PTR: 0,
                STACKTOP: 0,
                STACK_MAX: 0,
                abort: function () { },
                enlargeMemory: function () { },
                getTotalMemory: function () { },
                abortOnCannotGrowMemory: function () { },
                _emscripten_memcpy_big: function () { },
                ___lock: function () { },
                _abort: function () { },
                ___setErrNo: function () { },
                ___syscall6: function () { },
                ___syscall140: function () { },
                ___syscall146: function () { },
                ___syscall54: function () { },
                _silly: function () { },
                ___unlock: function () { },
                table: new WebAssembly.Table({ element: 'funcref', initial: 6, maximum: 6 }),
                memoryBase: 0,
                tableBase: 0,
            }
        });
        await $vm.createWasmStreamingCompilerForInstantiate(function (compiler) {
            slice(wasmBuffer, 20, (buffer) => compiler.addBytes(buffer));
        }, {
            env: {
                memory: new WebAssembly.Memory({ initial: 256, maximum: 256 }),
                DYNAMICTOP_PTR: 0,
                STACKTOP: 0,
                STACK_MAX: 0,
                abort: function () { },
                enlargeMemory: function () { },
                getTotalMemory: function () { },
                abortOnCannotGrowMemory: function () { },
                _emscripten_memcpy_big: function () { },
                ___lock: function () { },
                _abort: function () { },
                ___setErrNo: function () { },
                ___syscall6: function () { },
                ___syscall140: function () { },
                ___syscall146: function () { },
                ___syscall54: function () { },
                _silly: function () { },
                ___unlock: function () { },
                table: new WebAssembly.Table({ element: 'funcref', initial: 6, maximum: 6 }),
                memoryBase: 0,
                tableBase: 0,
            }
        });
    }
}

main().catch(function (error) {
    print(String(error));
    print(String(error.stack));
    $vm.abort()
});
