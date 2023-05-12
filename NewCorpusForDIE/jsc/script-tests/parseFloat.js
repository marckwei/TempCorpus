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

description('Tests for the parseFloat function.');

var nonASCIINonSpaceCharacter = String.fromCharCode(0x13A0);
var illegalUTF16Sequence = String.fromCharCode(0xD800);

var tab = String.fromCharCode(9);
var nbsp = String.fromCharCode(0xA0);
var ff = String.fromCharCode(0xC);
var vt = String.fromCharCode(0xB);
var cr = String.fromCharCode(0xD);
var lf = String.fromCharCode(0xA);
var ls = String.fromCharCode(0x2028);
var ps = String.fromCharCode(0x2029);

var oghamSpaceMark = String.fromCharCode(0x1680);
var mongolianVowelSeparator = String.fromCharCode(0x180E);
var enQuad = String.fromCharCode(0x2000);
var emQuad = String.fromCharCode(0x2001);
var enSpace = String.fromCharCode(0x2002);
var emSpace = String.fromCharCode(0x2003);
var threePerEmSpace = String.fromCharCode(0x2004);
var fourPerEmSpace = String.fromCharCode(0x2005);
var sixPerEmSpace = String.fromCharCode(0x2006);
var figureSpace = String.fromCharCode(0x2007);
var punctuationSpace = String.fromCharCode(0x2008);
var thinSpace = String.fromCharCode(0x2009);
var hairSpace = String.fromCharCode(0x200A);
var narrowNoBreakSpace = String.fromCharCode(0x202F);
var mediumMathematicalSpace = String.fromCharCode(0x205F);
var ideographicSpace = String.fromCharCode(0x3000);

shouldBe("parseFloat()", "NaN");
shouldBe("parseFloat('')", "NaN");
shouldBe("parseFloat(' ')", "NaN");
shouldBe("parseFloat(' 0')", "0");
shouldBe("parseFloat('0 ')", "0");
shouldBe("parseFloat('x0')", "NaN");
shouldBe("parseFloat('0x')", "0");
shouldBe("parseFloat(' 1')", "1");
shouldBe("parseFloat('1 ')", "1");
shouldBe("parseFloat('x1')", "NaN");
shouldBe("parseFloat('1x')", "1");
shouldBe("parseFloat(' 2.3')", "2.3");
shouldBe("parseFloat('2.3 ')", "2.3");
shouldBe("parseFloat('x2.3')", "NaN");
shouldBe("parseFloat('2.3x')", "2.3");
shouldBe("parseFloat('0x2')", "0");
shouldBe("parseFloat('1' + nonASCIINonSpaceCharacter)", "1");
shouldBe("parseFloat(nonASCIINonSpaceCharacter + '1')", "NaN");
shouldBe("parseFloat('1' + illegalUTF16Sequence)", "1");
shouldBe("parseFloat(illegalUTF16Sequence + '1')", "NaN");
shouldBe("parseFloat(tab + '1')", "1");
shouldBe("parseFloat(nbsp + '1')", "1");
shouldBe("parseFloat(ff + '1')", "1");
shouldBe("parseFloat(vt + '1')", "1");
shouldBe("parseFloat(cr + '1')", "1");
shouldBe("parseFloat(lf + '1')", "1");
shouldBe("parseFloat(ls + '1')", "1");
shouldBe("parseFloat(ps + '1')", "1");
shouldBe("parseFloat(oghamSpaceMark + '1')", "1");
shouldBe("parseFloat(mongolianVowelSeparator + '1')", "NaN");
shouldBe("parseFloat(enQuad + '1')", "1");
shouldBe("parseFloat(emQuad + '1')", "1");
shouldBe("parseFloat(enSpace + '1')", "1");
shouldBe("parseFloat(emSpace + '1')", "1");
shouldBe("parseFloat(threePerEmSpace + '1')", "1");
shouldBe("parseFloat(fourPerEmSpace + '1')", "1");
shouldBe("parseFloat(sixPerEmSpace + '1')", "1");
shouldBe("parseFloat(figureSpace + '1')", "1");
shouldBe("parseFloat(punctuationSpace + '1')", "1");
shouldBe("parseFloat(thinSpace + '1')", "1");
shouldBe("parseFloat(hairSpace + '1')", "1");
shouldBe("parseFloat(narrowNoBreakSpace + '1')", "1");
shouldBe("parseFloat(mediumMathematicalSpace + '1')", "1");
shouldBe("parseFloat(ideographicSpace + '1')", "1");
