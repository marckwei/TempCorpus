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

// This test isn't very effective in jsc-stress-tests; it appears that we get a large enough
// heap on a lot of machines that this just passes. Better to skip for now.
//@ skip

description(
"This test checks behavior with expressions that create deep parse trees."
);

// At the moment, this tests only repeated "+" operator expression trees.
// There are lots of other cases wer could cover to make this a more thorough test.

// Use a variable to decrease the chance the test will be invalid due to constnat folding.
var letterA = 'a';

function repeatedExpression(value, operator, count)
{
    var expression = value;
    for (var i = 1; i < count; ++i)
        expression += ' ' + operator + ' ' + value;
    return expression;
}

function repeatedString(value, count)
{
    var result = "";
    for (var i = 0; i < count; ++i)
        result += value;
    return result;
}

shouldBe('eval(repeatedExpression("letterA", "+", 100))', 'repeatedString("a", 100)');
shouldBe('eval(repeatedExpression("letterA", "+", 1000))', 'repeatedString("a", 1000)');
shouldThrow('eval(repeatedExpression("letterA", "+", 100000))');
