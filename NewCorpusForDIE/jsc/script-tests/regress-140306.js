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
"Regression test for https://webkit.org/b/140306. This test should run without any exceptions."
);

testArgs = [ 1, "Second", new Number(3) ];

function checkArgs(a0, a1, a2) {
    if (a0 !== testArgs[0])
        throw "Value of declared arg a0 is wrong.  Should be: " + testArgs[0] + ", was: " + a0;

    if (a1 !== testArgs[1])
        throw "Value of declared arg a1 is wrong.  Should be: " + testArgs[1] + ", was: " + a1;

    if (a2 !== testArgs[2])
        throw "Value of declared arg a2 is wrong.  Should be: " + testArgs[2] + ", was: " + a2;

    if (arguments.length != 3)
        throw "Length of arguments is wrong.  Should be: 3, was: " + arguments.length;

    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== testArgs[i])
            throw "Value of arguments[" + i + "] is wrong.  Should be: " + testArgs[i] + ", was: " + arguments[i];
    }
}

function applyToArgs() {
    arguments = testArgs;

    checkArgs.apply(this, arguments)

    try { } catch (e) { throw e; }  // To force the creation of an activation object
}

applyToArgs(42);
