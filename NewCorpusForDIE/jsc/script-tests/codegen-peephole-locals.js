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
"Tests whether peephole optimizations on bytecode properly deal with local registers."
);

function if_less_test()
{
    var a = 0;
    var b = 2;
    if (a = 1 < 2)
        return a == 1;
}

shouldBeTrue("if_less_test()");

function if_else_less_test()
{
    var a = 0;
    var b = 2;
    if (a = 1 < 2)
        return a == 1;
    else
        return false;
}

shouldBeTrue("if_else_less_test()");

function conditional_less_test()
{
    var a = 0;
    var b = 2;
    return (a = 1 < 2) ? a == 1 : false;
}

shouldBeTrue("conditional_less_test()");

function logical_and_less_test()
{
    var a = 0;
    var b = 2;
    return (a = 1 < 2) && a == 1;
}

shouldBeTrue("logical_and_less_test()");

function logical_or_less_test()
{
    var a = 0;
    var b = 2;
    var result = (a = 1 < 2) || a == 1;
    return a == 1;
}

shouldBeTrue("logical_or_less_test()");

function do_while_less_test()
{
    var a = 0;
    var count = 0;
    do {
        if (count == 1)
            return a == 1;
        count++;
    } while (a = 1 < 2)
}

shouldBeTrue("do_while_less_test()");

function while_less_test()
{
    var a = 0;
    while (a = 1 < 2)
        return a == 1;
}

shouldBeTrue("while_less_test()");

function for_less_test()
{
    for (var a = 0; a = 1 < 2; )
        return a == 1;
}

shouldBeTrue("for_less_test()");
