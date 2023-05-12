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

"This test checks that activation objects for functions called with too many arguments are created properly."

);


var c1;

function f1()
{
    var a = "x";
    var b = "y";
    var c = a + b;
    var d = a + b + c;

    c1 = function() { return d; }
}

f1(0, 0, 0, 0, 0, 0, 0, 0, 0);

function s1() {
    shouldBe("c1()", '"xyxy"');
}

function t1() {
    var a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p;
    s1();
}

t1();

var c2;

function f2()
{
    var a = "x";
    var b = "y";
    var c = a + b;
    var d = a + b + c;

    c2 = function() { return d; }
}

new f2(0, 0, 0, 0, 0, 0, 0, 0, 0);

function s2() {
    shouldBe("c2()", '"xyxy"');
}

function t2() {
    var a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p;
    s2();
}

t2();
