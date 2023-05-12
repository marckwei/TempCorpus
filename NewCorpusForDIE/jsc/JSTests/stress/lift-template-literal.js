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

function dump(callSite)
{
    return JSON.stringify({ cooked: callSite, raw: callSite.raw });
}

function shouldBe(actual, expected)
{
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

shouldBe(dump`\newcommand{\fun}{\textbf{Fun!}}`, `{"cooked":["\\newcommand{\\fun}{\\textbf{Fun!}}"],"raw":["\\\\newcommand{\\\\fun}{\\\\textbf{Fun!}}"]}`);
shouldBe(dump`\newcommand{\unicode}{\textbf{Unicode!}}`, `{"cooked":[null],"raw":["\\\\newcommand{\\\\unicode}{\\\\textbf{Unicode!}}"]}`);
shouldBe(dump`\newcommand{\xerxes}{\textbf{King!}}`, `{"cooked":[null],"raw":["\\\\newcommand{\\\\xerxes}{\\\\textbf{King!}}"]}`);
shouldBe(dump`Breve over the h goes \u{h}ere`, `{"cooked":[null],"raw":["Breve over the h goes \\\\u{h}ere"]}`);

function testTag(expected) {
    return function tag(callSite) {
        shouldBe(callSite.length, expected.cooked.length);
        shouldBe(callSite.raw.length, expected.raw.length);
        expected.cooked.forEach((value, index) => shouldBe(callSite[index], value));
        expected.raw.forEach((value, index) => shouldBe(callSite.raw[index], value));
    }
}

testTag({
    cooked: [ undefined ],
    raw: [ "\\unicode and \\u{55}" ],
})`\unicode and \u{55}`;

testTag({
    cooked: [ undefined, "test" ],
    raw: [ "\\unicode and \\u{55}", "test" ],
})`\unicode and \u{55}${42}test`;

testTag({
    cooked: [ undefined, undefined, "Cocoa" ],
    raw: [ "\\unicode and \\u{55}", "\\uhello", "Cocoa" ],
})`\unicode and \u{55}${42}\uhello${42}Cocoa`;

testTag({
    cooked: [ "Cocoa", undefined, undefined, "Cocoa" ],
    raw: [ "Cocoa", "\\unicode and \\u{55}", "\\uhello", "Cocoa" ],
})`Cocoa${42}\unicode and \u{55}${42}\uhello${42}Cocoa`;

testTag({
    cooked: [ "Cocoa", undefined, undefined, "Cocoa" ],
    raw: [ "Cocoa", "\\unicode and \\u{55}", "\\uhello", "Cocoa" ],
})`Cocoa${42}\unicode and \u{55}${42}\uhello${42}Cocoa`;

testTag({
    cooked: [ undefined, undefined, undefined ],
    raw: [ "\\00", "\\01", "\\1" ]
})`\00${42}\01${42}\1`;

testTag({
    cooked: [ undefined, undefined ],
    raw: [ "\\xo", "\\x0o" ]
})`\xo${42}\x0o`;

testTag({
    cooked: [ undefined, undefined, undefined, undefined ],
    raw: [ "\\uo", "\\u0o", "\\u00o", "\\u000o" ]
})`\uo${42}\u0o${42}\u00o${42}\u000o`;

testTag({
    cooked: [ undefined, undefined, undefined ],
    raw: [ "\\u{o", "\\u{0o", "\\u{110000o" ]
})`\u{o${42}\u{0o${42}\u{110000o`;
