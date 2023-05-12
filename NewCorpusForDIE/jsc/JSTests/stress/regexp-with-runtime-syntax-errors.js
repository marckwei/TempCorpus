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

// This test checks that malformed regular expressions compiled at runtime throw SyntaxErrors

function testThrowsSyntaxtError(f)
{
    try {
        f();
    } catch (e) {
        if (!e instanceof SyntaxError)
            throw "Expected SynteaxError, but got: " + e;
    }
}

function fromExecWithBadUnicodeEscape()
{
    let baseRE = /\u{123x}/;
    let line = "abc";

    (new RegExp(baseRE, "u")).exec(line);
}

function fromTestWithBadUnicodeProperty()
{
    let baseRE = /a|\p{Blah}/;
    let line = "abc";

    (new RegExp(baseRE, "u")).test(line);
}

function fromSplitWithBadUnicodeIdentity()
{
    let baseRE = /,|:|\-/;
    let line = "abc:def-ghi";

    let fields = line.split(new RegExp(baseRE, "u"));
}

function fromMatchWithBadUnicodeBackReference()
{
    let baseRE = /\123/;
    let line = "xyz";

    let fields = line.match(new RegExp(baseRE, "u"));
}

function fromReplaceWithBadUnicodeEscape()
{
    let baseRE = /\%/;
    let line = "xyz";

    let fields = line.replace(new RegExp(baseRE, "u"), "x");
}

function fromSearchWithBadUnicodeEscape()
{
    let baseRE = /\=/;
    let line = "xyz";

    let fields = line.search(new RegExp(baseRE, "u"));
}

testThrowsSyntaxtError(fromExecWithBadUnicodeEscape);
testThrowsSyntaxtError(fromTestWithBadUnicodeProperty);
testThrowsSyntaxtError(fromSplitWithBadUnicodeIdentity);
testThrowsSyntaxtError(fromMatchWithBadUnicodeBackReference);
testThrowsSyntaxtError(fromReplaceWithBadUnicodeEscape);
testThrowsSyntaxtError(fromSearchWithBadUnicodeEscape);
