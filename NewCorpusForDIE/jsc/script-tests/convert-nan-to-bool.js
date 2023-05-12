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

description("This test ensures that NaN is handled correctly when converting numeric expressions to booleans.");

shouldBe("NaN ? true : false", "false");
shouldBe("1 ? true : false", "true");
shouldBe("0 ? true : false", "false");
shouldBe("-1 ? true : false", "true");
shouldBe("1 * -1 ? true : false", "true");
shouldBe("1 * 0 ? true : false", "false");
shouldBe("1 * 1 ? true : false", "true");
shouldBe("1 / -1 ? true : false", "true");
shouldBe("1 / 0 ? true : false", "true");
shouldBe("1 / 1 ? true : false", "true");
shouldBe("1 % 2 ? true : false", "true");
shouldBe("1 % 1 ? true : false", "false");
shouldBe("1 + -1 ? true : false", "false");
shouldBe("1 + 0 ? true : false", "true");
shouldBe("1 + 1 ? true : false", "true");
shouldBe("1 - -1 ? true : false", "true");
shouldBe("1 - 0 ? true : false", "true");
shouldBe("1 - 1 ? true : false", "false");
shouldBe("1 & -1 ? true : false", "true");
shouldBe("1 & 0 ? true : false", "false");
shouldBe("1 & 1 ? true : false", "true");
shouldBe("1 | -1 ? true : false", "true");
shouldBe("1 | 0 ? true : false", "true");
shouldBe("1 | 1 ? true : false", "true");
shouldBe("1 ^ -1 ? true : false", "true");
shouldBe("1 ^ 0 ? true : false", "true");
shouldBe("1 ^ 1 ? true : false", "false");
shouldBe("NaN * -1 ? true : false", "false");
shouldBe("NaN * 0? true : false", "false");
shouldBe("NaN * 1? true : false", "false");
shouldBe("NaN / -1 ? true : false", "false");
shouldBe("NaN / 0? true : false", "false");
shouldBe("NaN / 1? true : false", "false");
shouldBe("NaN % -1 ? true : false", "false");
shouldBe("NaN % 0? true : false", "false");
shouldBe("NaN % 1? true : false", "false");
shouldBe("NaN + -1 ? true : false", "false");
shouldBe("NaN + 0? true : false", "false");
shouldBe("NaN + 1? true : false", "false");
shouldBe("NaN - -1 ? true : false", "false");
shouldBe("NaN - 0? true : false", "false");
shouldBe("NaN - 1? true : false", "false");
shouldBe("NaN & -1 ? true : false", "false");
shouldBe("NaN & 0? true : false", "false");
shouldBe("NaN & 1? true : false", "false");
shouldBe("NaN | -1 ? true : false", "true");
shouldBe("NaN | 0? true : false", "false");
shouldBe("NaN | 1? true : false", "true");
shouldBe("NaN ^ -1 ? true : false", "true");
shouldBe("NaN ^ 0? true : false", "false");
shouldBe("NaN ^ 1? true : false", "true");
shouldBe("+NaN ? true : false", "false");
shouldBe("-NaN ? true : false", "false");
shouldBe("NaN && true ? true : false", "false");
shouldBe("NaN && false ? true : false", "false");
shouldBe("NaN || true ? true : false", "true");
shouldBe("NaN || false ? true : false", "false");
shouldBe("(function(){var nan = NaN; return nan-- ? true : false})()", "false");
shouldBe("(function(){var nan = NaN; return nan++ ? true : false})()", "false");
shouldBe("(function(){var nan = NaN; return --nan ? true : false})()", "false");
shouldBe("(function(){var nan = NaN; return ++nan ? true : false})()", "false");
shouldBe("(function(){var Undefined = undefined; return Undefined-- ? true : false})()", "false");
shouldBe("(function(){var Undefined = undefined; return Undefined++ ? true : false})()", "false");
shouldBe("(function(){var Undefined = undefined; return --Undefined ? true : false})()", "false");
shouldBe("(function(){var Undefined = undefined; return ++Undefined ? true : false})()", "false");
