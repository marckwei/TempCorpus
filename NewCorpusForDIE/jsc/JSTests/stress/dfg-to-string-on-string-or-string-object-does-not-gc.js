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

//@ runDefault("--exceptionStackTraceLimit=0", "--defaultErrorStackTraceLimit=0", "--forceRAMSize=1000000", "--forceDebuggerBytecodeGeneration=1", "--useZombieMode=1", "--jitPolicyScale=0", "--collectContinuously=1", "--useConcurrentJIT=0")

function assert(b) {
    if (!b)
        throw new Error('aa');
}

let alternate = true;
var exception;
try {
    function alter(x) {
        alternate = !alternate;
        if (alternate)
            return new String(x);
        return x;
    }
    noInline(alter);
    let target = function (x, y) {
        const actual = '' + alter(x);
        target(x);
    };
    let handler = {
        apply: function (theTarget, thisArg, argArray) {
            return theTarget.apply([], argArray);
        }
    };
    let proxy = new Proxy(target, handler);
    assert(proxy("10", "20") === 'foo');
} catch(e) {
    exception = e;
}

if (exception != "RangeError: Maximum call stack size exceeded.")
    throw "FAILED";
