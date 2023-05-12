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
"This tests that speculation recovery of destructive additions on unboxed integers works."
);

function destructiveAddForBoxedInteger(a,b,c) {
    var a_ = a.x;
    var d = a_ + b;
    return c + d + b;
}

// warm-up foo to be integer
for (var i = 0; i < 100; ++i) {
    destructiveAddForBoxedInteger({x:1}, 2, 3);
}

shouldBe("destructiveAddForBoxedInteger({x:1}, 2, 4)", "9");
shouldBe("destructiveAddForBoxedInteger({x:2147483647}, 2, 4)", "2147483655");
shouldBe("destructiveAddForBoxedInteger({x:2}, 2147483647, 4)", "4294967300");
shouldBe("destructiveAddForBoxedInteger({x:2147483647}, 2147483647, 4)", "6442450945");
shouldBe("destructiveAddForBoxedInteger({x:1}, 2, 2147483647)", "2147483652");
