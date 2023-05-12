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
"Tests that if we have a tower of large numerical constants being added to each other, the DFG knows that a sufficiently large tower may produce a large enough value that overflow check elimination must be careful."
);

function foo(a, b) {
    return (a + b + 281474976710655 + 281474976710655 + 281474976710655 + 281474976710655 +
            281474976710655 + 281474976710655 + 281474976710655 + 281474976710655 +
            281474976710655 + 281474976710655 + 281474976710655 + 281474976710655 +
            281474976710655 + 281474976710655 + 281474976710655 + 281474976710655 +
            281474976710655 + 281474976710655 + 281474976710655 + 281474976710655 +
            281474976710655 + 281474976710655 + 281474976710655 + 281474976710655 +
            281474976710655 + 281474976710655 + 281474976710655 + 281474976710655 +
            281474976710655 + 281474976710655 + 281474976710655 + 281474976710655 + 30) | 0;
}

noInline(foo);
silentTestPass = true;

for (var i = 0; i < 2; i = dfgIncrement({f:foo, i:i + 1, n:1})) {
    var a, b, c;
    var expected;
    if (!i) {
        a = 1;
        b = 2;
        expected = 0;
    } else {
        a = 2147483645;
        b = 2147483644;
        expected = -10;
    }
    shouldBe("foo(" + a + ", " + b + ")", "" + expected);
}

