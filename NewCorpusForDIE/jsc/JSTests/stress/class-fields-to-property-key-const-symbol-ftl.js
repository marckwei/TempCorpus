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
let symbol = Symbol("test");
function constFoldSymbol(i) {
    class C {
        [symbol] = i;
    }
    didFTLCompile = ftlTrue();
    let c = new C();
    if (c[symbol] !== i)
        throw new Error(`Failed on iteration ${i}\n${JSON.stringify(c)}`);
}
noInline(constFoldSymbol);

let i = 0;
let maxTries = 10000;
for (; i < maxTries && !numberOfDFGCompiles(constFoldSymbol) && !didFTLCompile; ++i) {
    optimizeNextInvocation(constFoldSymbol);
    constFoldSymbol(i);
}

if (i >= maxTries)
    throw new Error("Failed to compile with DFG JIT");
