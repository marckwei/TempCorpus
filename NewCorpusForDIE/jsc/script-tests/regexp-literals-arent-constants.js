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

description("This test ensures that regeular expression literals are constants, and so persist over multiple executions");

for (var i = 0; i < 2; i++) {
    currentRegExp = /a/;
    if (i)
        shouldBeFalse("currentRegExp === lastRegExp");
    lastRegExp = currentRegExp;
}

function test1() {
    for (var i = 0; i < 2; i++) {
        currentRegExp = /a/;
        if (i)
            shouldBeFalse("currentRegExp === lastRegExp");
        lastRegExp = currentRegExp;
    }
}
test1();

function returnRegExpLiteral() { return /a/ }

shouldBeFalse("returnRegExpLiteral() === returnRegExpLiteral()");

function returnConditionalRegExpLiteral(first) {
    if (first)
        return /a/;
    return /a/;
}

shouldBeFalse("returnConditionalRegExpLiteral(true) === returnConditionalRegExpLiteral(true)");
shouldBeFalse("returnConditionalRegExpLiteral(false) === returnConditionalRegExpLiteral(false)");
shouldBeFalse("returnConditionalRegExpLiteral(true) === returnConditionalRegExpLiteral(false)");
returnRegExpLiteral().someAddedProperty = true;
shouldBeUndefined("returnRegExpLiteral().someAddedProperty");
