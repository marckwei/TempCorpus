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

description('Test the JavaScript ToNumber operation.')

var nullCharacter = String.fromCharCode(0);
var nonASCIICharacter = String.fromCharCode(0x100);
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

shouldBe("+undefined", "NaN");
shouldBe("+null", "0");
shouldBe("+false", "0");
shouldBe("+true", "1");
shouldBe("+2", "2");
shouldBe("+''", "0");
shouldBe("+' '", "0");
shouldBe("+' 1'", "1");
shouldBe("+'1 '", "1");
shouldBe("+'x1'", "NaN");
shouldBe("+'1x'", "NaN");
shouldBe("+'0x1'", "1");
shouldBe("+'1x0'", "NaN");
shouldBe("+(nullCharacter + '1')", "NaN");
shouldBe("+('1' + nullCharacter)", "NaN");
shouldBe("+('1' + nullCharacter + '1')", "NaN");
shouldBe("+(nonASCIICharacter + '1')", "NaN");
shouldBe("+('1' + nonASCIICharacter)", "NaN");
shouldBe("+('1' + nonASCIICharacter + '1')", "NaN");
shouldBe("+('1' + nonASCIINonSpaceCharacter)", "NaN");
shouldBe("+(nonASCIINonSpaceCharacter + '1')", "NaN");
shouldBe("+('1' + nonASCIINonSpaceCharacter + '1')", "NaN");
shouldBe("+(illegalUTF16Sequence + '1')", "NaN");
shouldBe("+('1' + illegalUTF16Sequence)", "NaN");
shouldBe("+('1' + illegalUTF16Sequence + '1')", "NaN");
shouldBe("+'inf'", "NaN");
shouldBe("+'infinity'", "NaN");
shouldBe("+'Inf'", "NaN");
shouldBe("+'+inf'", "NaN");
shouldBe("+'+infinity'", "NaN");
shouldBe("+'+Inf'", "NaN");
shouldBe("+'-inf'", "NaN");
shouldBe("+'-infinity'", "NaN");
shouldBe("+'-Inf'", "NaN");
shouldBe("+'Infinity'", "Infinity");
shouldBe("+'+Infinity'", "Infinity");
shouldBe("+'-Infinity'", "-Infinity");
shouldBe("+'++1'", "NaN");
shouldBe("+'AB'", "NaN");
shouldBe("+'0xAB'", "171");
shouldBe("+'1e1'", "10");
shouldBe("+'1E1'", "10");
shouldBe("+tab", "0");
shouldBe("+nbsp", "0");
shouldBe("+ff", "0");
shouldBe("+vt", "0");
shouldBe("+cr", "0");
shouldBe("+lf", "0");
shouldBe("+ls", "0");
shouldBe("+ps", "0");
shouldBe("+oghamSpaceMark", "0");
shouldBe("+mongolianVowelSeparator", "NaN");
shouldBe("+enQuad", "0");
shouldBe("+emQuad", "0");
shouldBe("+enSpace", "0");
shouldBe("+emSpace", "0");
shouldBe("+threePerEmSpace", "0");
shouldBe("+fourPerEmSpace", "0");
shouldBe("+sixPerEmSpace", "0");
shouldBe("+figureSpace", "0");
shouldBe("+punctuationSpace", "0");
shouldBe("+thinSpace", "0");
shouldBe("+hairSpace", "0");
shouldBe("+narrowNoBreakSpace", "0");
shouldBe("+mediumMathematicalSpace", "0");
shouldBe("+ideographicSpace", "0");
shouldBe("+(tab + '1')", "1");
shouldBe("+(nbsp + '1')", "1");
shouldBe("+(ff + '1')", "1");
shouldBe("+(vt + '1')", "1");
shouldBe("+(cr + '1')", "1");
shouldBe("+(lf + '1')", "1");
shouldBe("+(ls + '1')", "1");
shouldBe("+(ps + '1')", "1");
shouldBe("+(oghamSpaceMark + '1')", "1");
shouldBe("+(mongolianVowelSeparator + '1')", "NaN");
shouldBe("+(enQuad + '1')", "1");
shouldBe("+(emQuad + '1')", "1");
shouldBe("+(enSpace + '1')", "1");
shouldBe("+(emSpace + '1')", "1");
shouldBe("+(threePerEmSpace + '1')", "1");
shouldBe("+(fourPerEmSpace + '1')", "1");
shouldBe("+(sixPerEmSpace + '1')", "1");
shouldBe("+(figureSpace + '1')", "1");
shouldBe("+(punctuationSpace + '1')", "1");
shouldBe("+(thinSpace + '1')", "1");
shouldBe("+(hairSpace + '1')", "1");
shouldBe("+(narrowNoBreakSpace + '1')", "1");
shouldBe("+(mediumMathematicalSpace + '1')", "1");
shouldBe("+(ideographicSpace + '1')", "1");
shouldBe("+('1' + tab)", "1");
shouldBe("+('1' + nbsp)", "1");
shouldBe("+('1' + ff)", "1");
shouldBe("+('1' + vt)", "1");
shouldBe("+('1' + cr)", "1");
shouldBe("+('1' + lf)", "1");
shouldBe("+('1' + ls)", "1");
shouldBe("+('1' + ps)", "1");
shouldBe("+('1' + oghamSpaceMark)", "1");
shouldBe("+('1' + mongolianVowelSeparator)", "NaN");
shouldBe("+('1' + enQuad)", "1");
shouldBe("+('1' + emQuad)", "1");
shouldBe("+('1' + enSpace)", "1");
shouldBe("+('1' + emSpace)", "1");
shouldBe("+('1' + threePerEmSpace)", "1");
shouldBe("+('1' + fourPerEmSpace)", "1");
shouldBe("+('1' + sixPerEmSpace)", "1");
shouldBe("+('1' + figureSpace)", "1");
shouldBe("+('1' + punctuationSpace)", "1");
shouldBe("+('1' + thinSpace)", "1");
shouldBe("+('1' + hairSpace)", "1");
shouldBe("+('1' + narrowNoBreakSpace)", "1");
shouldBe("+('1' + mediumMathematicalSpace)", "1");
shouldBe("+('1' + ideographicSpace)", "1");
shouldBe("+('1' + tab + '1')", "NaN");
shouldBe("+('1' + nbsp + '1')", "NaN");
shouldBe("+('1' + ff + '1')", "NaN");
shouldBe("+('1' + vt + '1')", "NaN");
shouldBe("+('1' + cr + '1')", "NaN");
shouldBe("+('1' + lf + '1')", "NaN");
shouldBe("+('1' + ls + '1')", "NaN");
shouldBe("+('1' + ps + '1')", "NaN");
shouldBe("+('1' + oghamSpaceMark + '1')", "NaN");
shouldBe("+('1' + mongolianVowelSeparator + '1')", "NaN");
shouldBe("+('1' + enQuad + '1')", "NaN");
shouldBe("+('1' + emQuad + '1')", "NaN");
shouldBe("+('1' + enSpace + '1')", "NaN");
shouldBe("+('1' + emSpace + '1')", "NaN");
shouldBe("+('1' + threePerEmSpace + '1')", "NaN");
shouldBe("+('1' + fourPerEmSpace + '1')", "NaN");
shouldBe("+('1' + sixPerEmSpace + '1')", "NaN");
shouldBe("+('1' + figureSpace + '1')", "NaN");
shouldBe("+('1' + punctuationSpace + '1')", "NaN");
shouldBe("+('1' + thinSpace + '1')", "NaN");
shouldBe("+('1' + hairSpace + '1')", "NaN");
shouldBe("+('1' + narrowNoBreakSpace + '1')", "NaN");
shouldBe("+('1' + mediumMathematicalSpace + '1')", "NaN");
shouldBe("+('1' + ideographicSpace + '1')", "NaN");
