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

//@ runDefault("--thresholdForOptimizeAfterWarmUp=0", "--thresholdForOptimizeSoon=0", "--thresholdForFTLOptimizeAfterWarmUp=0")
function f3(a4) {
    const o7 = {
        ["forEach"]: "pCGSxWy10A",
        set e(a6) {
        },
    };
    return a4;
}
f3("forEach");
f3("pCGSxWy10A");
f3("function");
const v12 = new Int8Array();
const v14 = new Uint8ClampedArray(v12);
for (const v15 in "pCGSxWy10A") {
    for (let v16 = 0; v16 < 100; v16++) {
        for (let v18 = 0; v18 < 10; v18++) {
            try {
                (2147483649).toString(v16);
            } catch(e20) {
            }
        }
    }
}
f3(v12);
gc();