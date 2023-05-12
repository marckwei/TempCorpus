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

function Cons1()
{
    this.e = 1;
    this.f = 2;
}

Cons1.prototype.g = 1;

function Cons2()
{
    this.f = 1;
    this.h = 2;
}

Cons2.prototype.g = 2;

function Cons3()
{
    this.d = 1;
    this.e = 2;
    this.f = 3;
}

Cons3.prototype = Cons2.prototype;

function foo(o, p, q)
{
    var x = 0, y = 0;
    if (p)
        x = o.f;
    if (q)
        y = o.f;
    return x + y;
}

for (var i = 0; i < 10000; ++i) {
    foo(new Cons1(), true, false);
    foo(new Cons2(), false, true);
    foo(new Cons3(), false, true);
}

function bar(o, p)
{
    return foo(o, true, p);
}

noInline(bar);

for (var i = 0; i < 100000; ++i)
    bar(new Cons1(), false);

var result = bar(new Cons1(), true);
if (result != 4)
    throw "Error: bad result: " + result;

