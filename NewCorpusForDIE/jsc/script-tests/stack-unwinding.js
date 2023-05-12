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

"This test checks that JavaScriptCore does not crash when uwinding the stack that includes a host function."

);

function twoHostFunctions() {
    var stack = [];
    stack.push({ "args": twoHostFunctions.arguments });
    stack.push({ "args": twoHostFunctions.arguments });
    testPassed("Two host functions called in a row.");
}

function arrayOperatorFunction(element) {
    return element + 5;
}

var myArray = new Array (0, 1, 2);
function hostCallsUser(array) {
    return array.map(arrayOperatorFunction);
}

function throwException() {
    throw "Exception thrown";
}

function hostAndException() {
    var stack = [];
    stack.push({ "args": hostAndException.arguments });
    throwException();
}

twoHostFunctions();
myArray = hostCallsUser(myArray);
shouldBe('myArray', 'new Array( 5, 6, 7 )');

try {
    hostAndException();
} catch (e) {
    testPassed("Exception thrown and caught");
}

