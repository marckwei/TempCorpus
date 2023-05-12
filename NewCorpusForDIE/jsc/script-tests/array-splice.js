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
"This tests array.splice behavior."
);

var arr = ['a','b','c','d'];
shouldBe("arr", "['a','b','c','d']");
shouldBe("arr.splice(2)", "['c','d']");
shouldBe("arr", "['a','b']");
shouldBe("arr.splice(0)", "['a','b']");
shouldBe("arr", "[]")

arr = ['a','b','c','d'];
shouldBe("arr.splice()", "[]")
shouldBe("arr", "['a','b','c','d']");
shouldBe("arr.splice(undefined)", "['a','b','c','d']")
shouldBe("arr", "[]");

arr = ['a','b','c','d'];
shouldBe("arr.splice(null)", "['a','b','c','d']")
shouldBe("arr", "[]");

arr = ['a','b','c','d'];
shouldBe("arr.splice(100)", "[]")
shouldBe("arr", "['a','b','c','d']");
shouldBe("arr.splice(-1)", "['d']")
shouldBe("arr", "['a','b','c']");

shouldBe("arr.splice(2, undefined)", "[]")
shouldBe("arr.splice(2, null)", "[]")
shouldBe("arr.splice(2, -1)", "[]")
shouldBe("arr", "['a','b','c']");
shouldBe("arr.splice(2, 100)", "['c']")
shouldBe("arr", "['a','b']");

// Check this doesn't crash.
try {
    String(Array(0xFFFFFFFD).splice(0));
} catch (e) { }
