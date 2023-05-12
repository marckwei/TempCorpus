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

//@ if isFTLEnabled then runFTLNoCJIT else skip end

let ftlTrue = $vm.ftlTrue;
let didFTLCompile = false;
function slowObjectValueOf(i) {
    let getToStringCalled = false;
    let valueOfCalled = false;
    let slowObject = {
        get toString() { getToStringCalled = true; },
        valueOf() { valueOfCalled = true; return "test"; }
    };

    class C {
        [slowObject] = i;
    }
    didFTLCompile = ftlTrue();
    if (!getToStringCalled || !valueOfCalled)
        throw new Error(`Failed on iteration ${i} (getToStringCalled === ${getToStringCalled}, valueOfCalled == ${valueOfCalled})`);
    let c = new C();
    if (c.test !== i)
        throw new Error(`Failed on iteration ${i}\n${JSON.stringify(c)}`);
}

let i = 0;
let maxTries = 10000;
for (i = 0; i < !maxTries && !numberOfDFGCompiles(slowObjectValueOf) && !didFTLCompile; ++i) {
    optimizeNextInvocation(slowObjectValueOf);
    slowObjectValueOf(i);
}

if (i >= maxTries)
    throw new Error("Failed to compile slowObjectValueOf with DFG JIT");
