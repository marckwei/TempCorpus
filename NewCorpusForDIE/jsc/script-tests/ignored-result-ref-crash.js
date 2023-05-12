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
"This tests that bytecode code generation doesn't crash when it encounters odd cases of an ignored result."
);

function emptyStatementDoWhileTest()
{
    do
        ;
    while (false) { }
    return true;
}

shouldBeTrue("emptyStatementDoWhileTest()");

function debuggerDoWhileTest()
{
    do
        debugger;
    while (false) { }
    return true;
}

shouldBeTrue("debuggerDoWhileTest()");

function continueDoWhileTest()
{
    var i = 0;
    do
        i++;
    while (i < 10) {
        do
            continue;
        while (false) { }
    }
    return true;
}

shouldBeTrue("continueDoWhileTest()");

function breakDoWhileTest()
{
    var i = 0;
    do
        i++;
    while (i < 10) {
        do
            continue;
        while (false) { }
    }
    return true;
}

shouldBeTrue("breakDoWhileTest()");

function tryDoWhileTest()
{
    do
        try { } catch (o) { }
    while (false) { }
    return true;
}

shouldBeTrue("tryDoWhileTest()");
