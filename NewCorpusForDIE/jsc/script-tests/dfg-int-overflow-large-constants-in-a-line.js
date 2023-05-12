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
"Tests that our optimization to elide overflow checks understands that if we keep adding huge numbers, we could end up creating a number that is not precisely representable using doubles."
);

function foo(a) {
    var x = a;
    x += 281474976710655;
    x += 281474976710654;
    x += 281474976710653;
    x += 281474976710652;
    x += 281474976710655;
    x += 281474976710654;
    x += 281474976710653;
    x += 281474976710652;
    x += 281474976710655;
    x += 281474976710654;
    x += 281474976710653;
    x += 281474976710652;
    x += 281474976710655;
    x += 281474976710654;
    x += 281474976710653;
    x += 281474976710652;
    x += 281474976710655;
    x += 281474976710654;
    x += 281474976710653;
    x += 281474976710652;
    x += 281474976710655;
    x += 281474976710654;
    x += 281474976710653;
    x += 281474976710652;
    x += 281474976710655;
    x += 281474976710654;
    x += 281474976710653;
    x += 281474976710652;
    x += 281474976710655;
    x += 281474976710654;
    x += 281474976710653;
    x += 281474976710652;
    x += 281474976710655;
    x += 281474976710654;
    x += 281474976710653;
    x += 281474976710652;
    x += 281474976710655;
    x += 281474976710654;
    x += 281474976710653;
    x += 281474976710652;
    return x | 0
}

dfgShouldBe(foo, "foo(2147483647)", "2147483552");
