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
"Tests that ArrayPop is known to the DFG to be a side effect."
);

function foo(a, b) {
    var result = a.f;
    result += b.pop();
    result += a.g;
    return result;
}

noInline(foo);
silentTestPass = true;

var ouches = 0;
for (var i = 0; i < 200; i = dfgIncrement({f:foo, i:i + 1, n:100})) {
    var a = {f:1, g:2};
    var b = [];
    var expected;
    if (i < 150) {
        // Ensure that we always transition the array's structure to one that indicates
        // that we have array storage.
        b.__defineGetter__("0", function() {
            testFailed("Should never get here");
        });
        b.length = 0;
        b[0] = 42;
        expected = "45";
    } else {
        b.__defineGetter__("0", function() {
            debug("Ouch!");
            ouches++;
            delete a.g;
            a.h = 43;
            return 5;
        });
        expected = "0/0";
    }
    shouldBe("foo(a, b)", expected);
}

shouldBe("ouches", "50");
