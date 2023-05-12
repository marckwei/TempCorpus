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
function stringObjectToString(i) {
    class C {
        [new String("foo")] = i;
    }
    didFTLCompile = ftlTrue();
    let c = new C();
    if (c.foo !== i)
        throw new Error(`Failed on iteration ${i}\n${JSON.stringify(c)}`);
}
noInline(stringObjectToString);

let i = 0;
let maxTries = 30000;
for (; i < maxTries && !numberOfDFGCompiles(stringObjectToString) && !didFTLCompile; ++i) {
    optimizeNextInvocation(stringObjectToString);
    stringObjectToString(i);
}

if (i >= maxTries)
    throw new Error("Failed to compile stringObjectToString with DFG JIT");
