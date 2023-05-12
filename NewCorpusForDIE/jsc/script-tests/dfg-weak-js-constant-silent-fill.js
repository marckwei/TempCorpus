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

description(
"Tests that DFG silent spill and fill of WeakJSConstants does not result in nonsense."
);

function foo(a, b, c, d)
{
    a.f = 42; // WeakJSConstants corresponding to the o.f transition get created here.
    var x = !d; // Silent spilling and filling happens here.
    b.f = x; // The WeakJSConstants get reused here.
    var y = !d; // Silent spilling and filling happens here.
    c.f = y; // The WeakJSConstants get reused here.
}

var Empty = "";

for (var i = 0; i < 1000; ++i) {
    var o1 = new Object();
    var o2 = new Object();
    var o3 = new Object();
    eval(Empty + "foo(o1, o2, o3, \"stuff\")");
    shouldBe("o1.f", "42");
    shouldBe("o2.f", "false");
    shouldBe("o3.f", "false");
}

