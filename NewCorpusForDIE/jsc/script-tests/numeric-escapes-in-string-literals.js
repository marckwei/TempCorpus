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
"Test numeric escapes in string literals - https://bugs.webkit.org/show_bug.cgi?id=51724"
);

function test(_stringLiteral, _nonStrictResult, _strictResult)
{
    stringLiteral = '"' + _stringLiteral + '"';
    nonStrictResult = _nonStrictResult;
    shouldBe("eval(stringLiteral)", "nonStrictResult");

    stringLiteral = '"use strict"; ' + stringLiteral;
    if (_strictResult) {
        strictResult = _strictResult;
        shouldBe("eval(stringLiteral)", "strictResult");
    } else
        shouldThrow("eval(stringLiteral)");
}

// Tests for single digit octal and decimal escapes.
// In non-strict mode 0-7 are octal escapes, 8-9 are NonEscapeCharacters.
// In strict mode only "\0" is permitted.
test("\\0", "\x00", "\x00");
test("\\1", "\x01");
test("\\7", "\x07");
test("\\8", "8");
test("\\9", "9");

// Tests for multi-digit octal values outside strict mode;
// Octal literals may be 1-3 digits long.  In strict more all multi-digit sequences are illegal.
test("\\00", "\x00");
test("\\000", "\x00");
test("\\0000", "\x000");

test("\\01", "\x01");
test("\\001", "\x01");
test("\\0001", "\x001");

test("\\10", "\x08");
test("\\100", "\x40");
test("\\1000", "\x400");

test("\\19", "\x019");
test("\\109", "\x089");
test("\\1009", "\x409");

test("\\99", "99");
