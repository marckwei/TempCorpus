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
"This test checks that object literals are serialized properly. " +
"It's needed in part because JavaScriptCore converts numeric property names to string and back."
);

function compileAndSerialize(expression)
{
    var f = eval("(function () { return " + expression + "; })");
    var serializedString = f.toString();
    serializedString = serializedString.replace(/[ \t\r\n]+/g, " ");
    serializedString = serializedString.replace("function () { return ", "");
    serializedString = serializedString.replace("; }", "");
    return serializedString;
}

shouldBe("compileAndSerialize('a = { 1: null }')", "'a = { 1: null }'");
shouldBe("compileAndSerialize('a = { 0: null }')", "'a = { 0: null }'");
shouldBe("compileAndSerialize('a = { 1.0: null }')", "'a = { 1.0: null }'");
shouldBe("compileAndSerialize('a = { \"1.0\": null }')", "'a = { \"1.0\": null }'");
shouldBe("compileAndSerialize('a = { 1e-500: null }')", "'a = { 1e-500: null }'");
shouldBe("compileAndSerialize('a = { 1e-300: null }')", "'a = { 1e-300: null }'");
shouldBe("compileAndSerialize('a = { 1e300: null }')", "'a = { 1e300: null }'");
shouldBe("compileAndSerialize('a = { 1e500: null }')", "'a = { 1e500: null }'");

shouldBe("compileAndSerialize('a = { NaN: null }')", "'a = { NaN: null }'");
shouldBe("compileAndSerialize('a = { Infinity: null }')", "'a = { Infinity: null }'");

shouldBe("compileAndSerialize('a = { \"1\": null }')", "'a = { \"1\": null }'");
shouldBe("compileAndSerialize('a = { \"1hi\": null }')", "'a = { \"1hi\": null }'");
shouldBe("compileAndSerialize('a = { \"\\\'\": null }')", "'a = { \"\\\'\": null }'");
shouldBe("compileAndSerialize('a = { \"\\\\\"\": null }')", "'a = { \"\\\\\"\": null }'");

shouldBe("compileAndSerialize('a = { get x() { } }')", "'a = { get x() { } }'");
shouldBe("compileAndSerialize('a = { set x(y) { } }')", "'a = { set x(y) { } }'");

shouldThrow("compileAndSerialize('a = { --1: null }')");
shouldThrow("compileAndSerialize('a = { -NaN: null }')");
shouldThrow("compileAndSerialize('a = { -0: null }')");
shouldThrow("compileAndSerialize('a = { -0.0: null }')");
shouldThrow("compileAndSerialize('a = { -Infinity: null }')");
