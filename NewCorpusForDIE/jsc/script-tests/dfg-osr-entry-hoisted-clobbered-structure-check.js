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

//@ noNoLLIntRunLayoutTest if $architecture == "arm"

description(
"Tests that performing an OSR entry into a loop with a hoisted structure check, where the loop may clobber the world, works."
);

function foo(o, n) {
    var result = 0;
    for (var i = 0; i < n; ++i) {
        result += o.f;
        result += o.g(i);
        if (i > 1)
            result += o.i;
        if (i > 2)
            result += o.j;
        o = o.h(i);
        result += o.g(i);
    }
    return result;
}

function bar(i) {
    var str = "var x" + i + " = 42; x" + i;
    return eval(str);
}

var counter = 0;
function baz(i) {
    var str = "var x" + i + " = 42; x" + i;
    eval(str);
    if (i == 1100)
        return {g:bar, i:3, j:4, h:baz, f:2 + counter++};
    return this;
}

var object = {f:1, g:bar, h:baz, i:2, j:3};
shouldBe("foo(object, 10000)", "926684");


