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
"Tests that -2^31/-1 (and a bunch of other corner cases) does the right thing."
);

function myDiv(a, b) {
    return a / b;
}

function myDivByNeg1(a) {
    return a / -1;
}

function myDivNeg2ToThe31(b) {
    return -2147483648 / b;
}

function myMod(a, b) {
    return a % b;
}

function myModByNeg1(a) {
    return a % -1;
}

function myModBy2(a) {
    return a % 2;
}

function myModBy1073741824(a) {
    return a % 1073741824;
}

function myModNeg2ToThe31(b) {
    return -2147483648 % b;
}

function myOtherDiv(a, b) {
    return a / b;
}

function myOtherDivByNeg1(a) {
    return a / -1;
}

function myOtherDivNeg2ToThe31(b) {
    return -2147483648 / b;
}

function myOtherMod(a, b) {
    return a % b;
}

function myOtherModByNeg1(a) {
    return a % -1;
}

function myOtherModNeg2ToThe31(b) {
    return -2147483648 % b;
}

function myDivExpectingInt(a, b) {
    return (a / b) | 0;
}

var w = 4;
var v = 2;
var x = -2147483648;
var y = -1;
var z = 3;

// Use a loop to ensure we cover all three tiers of optimization.
for (var i = 0; i < 200; ++i) {
    shouldBe("myDiv(x, y)", "2147483648");
    shouldBe("myDivByNeg1(x)", "2147483648");
    shouldBe("myDivNeg2ToThe31(y)", "2147483648");
    shouldBe("myMod(x, y)", "-0");
    shouldBe("myMod(x, z)", "-2");
    shouldBe("myModByNeg1(x)", "-0");
    shouldBe("myModBy2(x)", "-0");
    shouldBe("myModBy1073741824(x)", "-0");
    shouldBe("myModBy2(y)", "-1");
    shouldBe("myModBy1073741824(y)", "-1");
    shouldBe("myModBy2(z)", "1");
    shouldBe("myModBy1073741824(z)", "3");
    shouldBe("myModNeg2ToThe31(y)", "-0");
    if (i > 100) {
        w = x;
        v = y;
    }
    shouldBe("myOtherDiv(w, v)", i > 100 ? "2147483648" : "2");
    shouldBe("myOtherDivByNeg1(w)", i > 100 ? "2147483648" : "-4");
    shouldBe("myOtherDivNeg2ToThe31(v)", i > 100 ? "2147483648" : "-1073741824");
    shouldBe("myOtherMod(w, v)", i > 100 ? "-0" : "0");
    shouldBe("myOtherModByNeg1(w)", i > 100 ? "-0" : "0");
    shouldBe("myOtherModNeg2ToThe31(v)", "-0");
    shouldBe("myOtherModNeg2ToThe31(3)", "-2");
    shouldBe("myDivExpectingInt(x, y)", "x");
}

