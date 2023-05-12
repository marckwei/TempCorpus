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

//@ skip if $memoryLimited
//@ requireOptions("-e", "let arraysize=0x100000") if ["arm", "mips"].include?($architecture)
//@ runDefault("--useConcurrentJIT=0", "--thresholdForJITAfterWarmUp=10", "--slowPathAllocsBetweenGCs=10", "--useConcurrentGC=0")

arraysize = typeof(arraysize) === 'undefined' ? 0x1000000 : arraysize;

function fullGC() {
    for (var i = 0; i < 10; i++) {
        new Float64Array(arraysize);
    }
}

function outer() {
    function f() {
        try {
            const r = f();
        } catch(e) {
            const o = Object();
            function inner(a1, a2, a3) {
                try {
                    const r1 = new Uint32Array();
                    const r2 = r1.values();
                } catch(e2) {
                }
            }
            const result = inner();
        }
    }

    f();

    function edenGC() {
        for (let i = 0; i < 100; i++) {
            const floatArray = new Float64Array(0x10000);
        }
    }
    edenGC();
}

for (let i = 0; i < 100; i++) {
    const result = outer();
}

fullGC();

