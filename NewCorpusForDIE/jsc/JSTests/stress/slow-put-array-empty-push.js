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

//@ runDefault("--useConcurrentGC=0", "--returnEarlyFromInfiniteLoopsForFuzzing=1", "--earlyReturnFromInfiniteLoopsLimit=1000000", "--verifyGC=true", "--forceGCSlowPaths=true", "--forceEagerCompilation=1", "--jitPolicyScale=0", "--useConcurrentJIT=0")
function runNearStackLimit() {
  __v_21 = []
  try {
    try {
        __v_21.push()} catch {}
  } catch {}
}
function __f_6() {
  try {
       runNearStackLimit()
  } catch {}
}
try {
  __f_6()
  for (__v_19 = 0; __v_19 < 10; ++__v_19)
    try {
      Object.defineProperty(Array.prototype, __v_19, {})} catch {}
} catch {}
function __f_32() {
  try {
    __f_6()
      } catch {}
}
try {
  __f_32()
  __f_32()} catch {}
