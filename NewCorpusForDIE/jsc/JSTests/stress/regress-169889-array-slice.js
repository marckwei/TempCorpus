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

//@ runFTLNoCJIT

Array.prototype.__defineGetter__(100, () => 1);

let childGlobal = createGlobalObject();
let a = new childGlobal.Array(2.3023e-320, 2.3023e-320, 2.3023e-320, 2.3023e-320, 2.3023e-320, 2.3023e-320);

var tierWarmUpIterations = [
    1, // LLInt
    50, // baseline JIT
    500, // DFG
    10000, // FTL
];

function doTest(warmUpIterations) {
    var test = new Function("a", "return Array.prototype.slice.call(a).toString();");
    noInline(test);

    for (var i = 0; i < warmUpIterations; i++)
        test([1, 2, 3]);

    test(a);
}

for (var warmUpIterations of tierWarmUpIterations)
    doTest(warmUpIterations);
