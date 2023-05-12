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

function bar()
{
}

noInline(bar);

function foo(p, x)
{
    var a = /Hello/;
    a.lastIndex = 1;
    var b = /World/;
    b.lastIndex = a;
    var c = /World/;
    c.lastIndex = a;
    var d = /Cocoa/;
    d.lastIndex = c;
    a.lastIndex = d;

    if (!p)
        return 0;

    bar(b);

    x += 2000000000;

    c.lastIndex.lastIndex = 42;
    return b.lastIndex.lastIndex;
}

noInline(foo);

function test(x)
{
    var result = foo(true, x);
    if (result != 42)
        throw "Error: bad result: " + result;
}

for (var i = 0; i < 100000; ++i)
    test(0);

test(2000000000);

