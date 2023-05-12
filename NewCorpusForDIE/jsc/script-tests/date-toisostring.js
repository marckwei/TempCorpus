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

description("Tests for Date.toISOString");

function throwsRangeError(str)
{
    try {
        eval(str);
    } catch (e) {
        return e instanceof RangeError;
    }
    return false;
}

shouldThrow("Date.toISOString.call({})");
shouldThrow("Date.toISOString.call(0)");

shouldBe("new Date(-400).toISOString()", "'1969-12-31T23:59:59.600Z'");
shouldBe("new Date(0).toISOString()", "'1970-01-01T00:00:00.000Z'");
shouldBe("new Date('1 January 1500 UTC').toISOString()", "'1500-01-01T00:00:00.000Z'");
shouldBe("new Date('1 January 2000 UTC').toISOString()", "'2000-01-01T00:00:00.000Z'");
shouldBe("new Date('1 January 4000 UTC').toISOString()", "'4000-01-01T00:00:00.000Z'");
shouldBe("new Date('1 January 100000 UTC').toISOString()", "'+100000-01-01T00:00:00.000Z'");
shouldBe("new Date('1 January -1 UTC').toISOString()", "'-000001-01-01T00:00:00.000Z'");
shouldBe("new Date('10 March 2000 UTC').toISOString()", "'2000-03-10T00:00:00.000Z'");
shouldBeTrue('throwsRangeError("new Date(NaN).toISOString()")');
