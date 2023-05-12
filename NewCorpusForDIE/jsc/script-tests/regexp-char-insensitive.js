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
"This test checks the case-insensitive matching of character literals."
);

shouldBeTrue("/\u00E5/i.test('/\u00E5/')");
shouldBeTrue("/\u00E5/i.test('/\u00C5/')");
shouldBeTrue("/\u00C5/i.test('/\u00E5/')");
shouldBeTrue("/\u00C5/i.test('/\u00C5/')");

shouldBeFalse("/\u00E5/i.test('P')");
shouldBeFalse("/\u00E5/i.test('PASS')");
shouldBeFalse("/\u00C5/i.test('P')");
shouldBeFalse("/\u00C5/i.test('PASS')");

shouldBeNull("'PASS'.match(/\u00C5/i)");
shouldBeNull("'PASS'.match(/\u00C5/i)");

shouldBe("'PAS\u00E5'.replace(/\u00E5/ig, 'S')", "'PASS'");
shouldBe("'PAS\u00E5'.replace(/\u00C5/ig, 'S')", "'PASS'");
shouldBe("'PAS\u00C5'.replace(/\u00E5/ig, 'S')", "'PASS'");
shouldBe("'PAS\u00C5'.replace(/\u00C5/ig, 'S')", "'PASS'");

shouldBe("'PASS'.replace(/\u00E5/ig, '%C3%A5')", "'PASS'");
shouldBe("'PASS'.replace(/\u00C5/ig, '%C3%A5')", "'PASS'");
