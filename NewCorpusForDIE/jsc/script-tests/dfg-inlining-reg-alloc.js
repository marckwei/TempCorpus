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
"This tests that register allocation still works under register pressure induced by inlining, out-of-line function calls (i.e. unconditional register flushing), and slow paths for object creation (i.e. conditional register flushing)."
);

// Inlineable constructor.
function foo(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
}

// Non-inlineable function. This relies on a size limit for inlining, but still
// produces integers. It also relies on the VM not reasoning about Math.log deeply
// enough to find some way of optimizing this code to be small enough to inline.
function bar(a, b) {
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    a += b;
    a -= b;
    b ^= a;
    a += Math.log(b);
    b += a;
    b -= a;
    a ^= b;
    return (a - b) | 0;
}

// Function into which we will inline foo but not bar.
function baz(a, b) {
    return new foo(bar(2 * a + 1, b - 1), bar(2 * a, b - 1), a);
}

// Do the test. It's crucial that o.a, o.b, and o.c are checked on each
// loop iteration.
for (var i = 0; i < 1000; ++i) {
    var o = baz(i, i + 1);
    shouldBe("o.a", "bar(2 * i + 1, i)");
    shouldBe("o.b", "bar(2 * i, i)");
    shouldBe("o.c", "i");
}
