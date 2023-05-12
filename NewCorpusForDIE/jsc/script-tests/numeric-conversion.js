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
"This test checks for accuracy in numeric conversions, particularly with large or infinite values."
);

shouldBe("Number(1152921504606847105).toString()", "'1152921504606847200'");
shouldBe("parseInt('1152921504606847105').toString()", "'1152921504606847200'");
shouldBe("(- (- '1152921504606847105')).toString()", "'1152921504606847200'");

shouldBe("Number(0x1000000000000081).toString(16)", "'1000000000000100'");
shouldBe("parseInt('0x1000000000000081', 16).toString(16)", "'1000000000000100'");
shouldBe("(- (- '0x1000000000000081')).toString(16)", "'1000000000000100'");

shouldBe("Number(0100000000000000000201).toString(8)", "'100000000000000000400'");
shouldBe("parseInt('100000000000000000201', 8).toString(8)", "'100000000000000000400'");

shouldBe("(- 'infinity').toString()", "'NaN'");

shouldBe("parseInt('1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000').toString()", "'Infinity'");
shouldBe("parseInt('0x100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 16).toString()", "'Infinity'");
shouldBe("parseInt('100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 8).toString()", "'Infinity'");

shouldBe("parseInt('9007199254740992e2000').toString()", "'9007199254740992'");
shouldBe("parseInt('9007199254740992.0e2000').toString()", "'9007199254740992'");

shouldBe("parseInt(NaN)", "NaN");
shouldBe("parseInt(-Infinity)", "NaN");
shouldBe("parseInt(Infinity)", "NaN");

shouldBe("parseInt(-0.6).toString()", "'0'");
