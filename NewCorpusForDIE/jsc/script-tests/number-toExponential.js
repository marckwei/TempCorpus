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

var posInf = 1/0;
var negInf = -1/0;
var nan = 0/0;

// From Acid3, http://bugs.webkit.org/show_bug.cgi?id=16640
shouldBeEqualToString("(0.0).toExponential(4)", "0.0000e+0");
shouldBeEqualToString("(-0.0).toExponential(4)", "0.0000e+0");
shouldBeEqualToString("(0.0).toExponential()", "0e+0");
shouldBeEqualToString("(-0.0).toExponential()", "0e+0");
// From http://bugs.webkit.org/show_bug.cgi?id=5259
shouldBeEqualToString("(123.456).toExponential()", "1.23456e+2");
shouldBeEqualToString("(123.456).toExponential(0)", "1e+2");
// 0 equivilents
shouldBeEqualToString("(123.456).toExponential(null)", "1e+2");
shouldBeEqualToString("(123.456).toExponential(false)", "1e+2");
shouldBeEqualToString("(123.456).toExponential('foo')", "1e+2");
shouldBeEqualToString("(123.456).toExponential(nan)", "1e+2"); // nan is treated like 0

shouldBeEqualToString("(123.456).toExponential(1)", "1.2e+2");
// 1 equivilents
shouldBeEqualToString("(123.456).toExponential(true)", "1.2e+2"); // just like 1
shouldBeEqualToString("(123.456).toExponential('1')", "1.2e+2");

shouldBeEqualToString("(123.456).toExponential(2)", "1.23e+2");
shouldBeEqualToString("(123.456).toExponential(2.9)", "1.23e+2");
shouldBeEqualToString("(123.456).toExponential(3)", "1.235e+2");
shouldBeEqualToString("(123.456).toExponential(5)", "1.23456e+2");
shouldBeEqualToString("(123.456).toExponential(6)", "1.234560e+2");
shouldBeEqualToString("(123.456).toExponential(20)", "1.23456000000000003070e+2");
shouldBeEqualToString("(123.456).toExponential(21)", "1.234560000000000030695e+2");
shouldBeEqualToString("(123.456).toExponential(100)", "1.2345600000000000306954461848363280296325683593750000000000000000000000000000000000000000000000000000e+2");

shouldThrow("(123.456).toExponential(101)");
shouldThrow("(123.456).toExponential(-1)");

shouldThrow("(1234.567).toExponential(posInf)");
shouldThrow("(1234.567).toExponential(negInf)");

shouldBeEqualToString("posInf.toExponential()", "Infinity");
shouldBeEqualToString("negInf.toExponential()", "-Infinity");
shouldBeEqualToString("nan.toExponential()", "NaN");

shouldBeEqualToString("(0.01).toExponential()", "1e-2");
shouldBeEqualToString("(0.1).toExponential()", "1e-1");
shouldBeEqualToString("(0.9).toExponential()", "9e-1");
shouldBeEqualToString("(0.9999).toExponential()", "9.999e-1");
shouldBeEqualToString("(0.9999).toExponential(2)", "1.00e+0");
