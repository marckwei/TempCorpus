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

// Require lots of arguments so that arity fixup will need a lot of stack, making
// it prone to stack overflow.
var script = "";
for (var i = 0; i < 128; ++i)
    script += "dummy, "
script += "dummy";
var g = new Function(script, "return arguments;"); // Ensure that arguments are observed.

function f(recursionCount)
{
    if (!recursionCount)
        return;

    // Use too few arguments to force arity fixup.
    g();

    f(--recursionCount);
}

noInline(g);
noInline(f);

// Ensure that f and g get optimized.
for (var i = 0; i < 1000000; ++i) {
    // Recurse once to ensure profiling along all control flow paths.
    f(1);
}

try {
    // Recurse enough times to trigger a stack overflow exception.
    f(1000000);
} catch(e) {
    if (! (e instanceof RangeError))
        throw "bad value for e";
}
