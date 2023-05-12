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
"This tests that the DFG can multiply numbers correctly."
);

function doMultiplyConstant2(a) {
    return a * 2;
}

function doMultiplyConstant3(a) {
    return a * 3;
}

function doMultiplyConstant4(a) {
    return a * 4;
}

// Get it to compile.
for (var i = 0; i < 100; ++i) {
    shouldBe("doMultiplyConstant2(1)", "2");
    shouldBe("doMultiplyConstant2(2)", "4");
    shouldBe("doMultiplyConstant2(4)", "8");
    shouldBe("doMultiplyConstant3(1)", "3");
    shouldBe("doMultiplyConstant3(2)", "6");
    shouldBe("doMultiplyConstant3(4)", "12");
    shouldBe("doMultiplyConstant4(1)", "4");
    shouldBe("doMultiplyConstant4(2)", "8");
    shouldBe("doMultiplyConstant4(4)", "16");
}

// Now do evil.
for (var i = 0; i < 10; ++i) {
    shouldBe("doMultiplyConstant2(1073741824)", "2147483648");
    shouldBe("doMultiplyConstant2(2147483648)", "4294967296");
    shouldBe("doMultiplyConstant3(1073741824)", "3221225472");
    shouldBe("doMultiplyConstant3(2147483648)", "6442450944");
    shouldBe("doMultiplyConstant4(1073741824)", "4294967296");
    shouldBe("doMultiplyConstant4(2147483648)", "8589934592");
    shouldBe("doMultiplyConstant2(-1073741824)", "-2147483648");
    shouldBe("doMultiplyConstant2(-2147483648)", "-4294967296");
    shouldBe("doMultiplyConstant3(-1073741824)", "-3221225472");
    shouldBe("doMultiplyConstant3(-2147483648)", "-6442450944");
    shouldBe("doMultiplyConstant4(-1073741824)", "-4294967296");
    shouldBe("doMultiplyConstant4(-2147483648)", "-8589934592");
}

