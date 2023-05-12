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

//@ requireOptions("--useStringWellFormed=1")
function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

shouldBe("".isWellFormed(), true);
shouldBe("".toWellFormed(), "");

shouldBe("Hello World".isWellFormed(), true);
shouldBe("Hello World".toWellFormed(), "Hello World");

shouldBe("こんにちわ".isWellFormed(), true);
shouldBe("こんにちわ".toWellFormed(), "こんにちわ");

shouldBe("𠮷野家".isWellFormed(), true);
shouldBe("𠮷野家".toWellFormed(), "𠮷野家");

shouldBe("A\uD842".isWellFormed(), false);
shouldBe("A\uD842".toWellFormed(), "A\uFFFD");

shouldBe("A\uD842A".isWellFormed(), false);
shouldBe("A\uD842A".toWellFormed(), "A\uFFFDA");

shouldBe("A\uD842\uDFB7".isWellFormed(), true);
shouldBe("A\uD842\uDFB7".toWellFormed(), "A\uD842\uDFB7");

shouldBe("A\uDFB7".isWellFormed(), false);
shouldBe("A\uDFB7".toWellFormed(), "A\uFFFD");

shouldBe("A\uDFB7\uD842".isWellFormed(), false);
shouldBe("A\uDFB7\uD842".toWellFormed(), "A\uFFFD\uFFFD");
