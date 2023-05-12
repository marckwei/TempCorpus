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

load("./driver/driver.js");

function foo(){ }
function bar(){ }
function baz(){ }

function testConditionalBasic(x) {
    return x ? 10 : 20;
}


testConditionalBasic(false);
checkBasicBlock(testConditionalBasic, "x", ShouldHaveExecuted);
checkBasicBlock(testConditionalBasic, "20", ShouldHaveExecuted);
checkBasicBlock(testConditionalBasic, "10", ShouldNotHaveExecuted);

testConditionalBasic(true);
checkBasicBlock(testConditionalBasic, "10", ShouldHaveExecuted);


function testConditionalFunctionCall(x, y) {
    x ? y ? foo() 
        : baz() 
        : bar()
}
testConditionalFunctionCall(false, false);
checkBasicBlock(testConditionalFunctionCall, "x ?", ShouldHaveExecuted);
checkBasicBlock(testConditionalFunctionCall, "? y", ShouldHaveExecuted);
checkBasicBlock(testConditionalFunctionCall, "bar", ShouldHaveExecuted);
checkBasicBlock(testConditionalFunctionCall, ": bar", ShouldHaveExecuted);
checkBasicBlock(testConditionalFunctionCall, "y ?", ShouldNotHaveExecuted);
checkBasicBlock(testConditionalFunctionCall, "? foo", ShouldNotHaveExecuted);
checkBasicBlock(testConditionalFunctionCall, "foo", ShouldNotHaveExecuted);
checkBasicBlock(testConditionalFunctionCall, "baz", ShouldNotHaveExecuted);

testConditionalFunctionCall(true, false);
checkBasicBlock(testConditionalFunctionCall, "y ?", ShouldHaveExecuted);
checkBasicBlock(testConditionalFunctionCall, "? foo", ShouldHaveExecuted);
checkBasicBlock(testConditionalFunctionCall, ": baz", ShouldHaveExecuted);
checkBasicBlock(testConditionalFunctionCall, "baz", ShouldHaveExecuted);
checkBasicBlock(testConditionalFunctionCall, "foo", ShouldNotHaveExecuted);

testConditionalFunctionCall(true, true);
checkBasicBlock(testConditionalFunctionCall, "foo", ShouldHaveExecuted);
