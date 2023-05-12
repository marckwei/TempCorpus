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
"This test checks the behavior of the Array.prototype.fill()"
);

shouldBe("Array.prototype.fill.length", "1");
shouldBe("Array.prototype.fill.name", "'fill'");

shouldBe("[0, 0, 0, 0, 0].fill()", "[undefined, undefined, undefined, undefined, undefined]");
shouldBe("[0, 0, 0, 0, 0].fill(3)", "[3, 3, 3, 3, 3]");
shouldBe("[0, 0, 0, 0, 0].fill(3, 1)", "[0, 3, 3, 3, 3]");
shouldBe("[0, 0, 0, 0, 0].fill(3, 1, 3)", "[0, 3, 3, 0, 0]");
shouldBe("[0, 0, 0, 0, 0].fill(3, 1, 1000)", "[0, 3, 3, 3, 3]");
shouldBe("[0, 0, 0, 0, 0].fill(3, -2, 1000)", "[0, 0, 0, 3, 3]");
shouldBe("[0, 0, 0, 0, 0].fill(3, -2, 4)", "[0, 0, 0, 3, 0]");
shouldBe("[0, 0, 0, 0, 0].fill(3, -2, -1)", "[0, 0, 0, 3, 0]");
shouldBe("[0, 0, 0, 0, 0].fill(3, -2, -3)", "[0, 0, 0, 0, 0]");
shouldBe("[0, 0, 0, 0, 0].fill(3, undefined, 4)", "[3, 3, 3, 3, 0]");
shouldBe("[ ,  ,  ,  , 0].fill(3, 1, 3)", "[, 3, 3, , 0]");

debug("Array-like object with invalid lengths");
var throwError = function throwError() {
    throw new Error("should not reach here");
};
shouldBe("var obj = Object.freeze({ 0: 1, length: 0 }); Array.prototype.fill.call(obj, throwError); JSON.stringify(obj)", "'{\"0\":1,\"length\":0}'");
shouldBe("var obj = Object.freeze({ 0: 1, length: -0 }); Array.prototype.fill.call(obj, throwError); JSON.stringify(obj)", "'{\"0\":1,\"length\":0}'");
shouldBe("var obj = Object.freeze({ 0: 1, length: -3 }); Array.prototype.fill.call(obj, throwError); JSON.stringify(obj)", "'{\"0\":1,\"length\":-3}'");

successfullyParsed = true;
