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

function Foo(a, b) {
    var array = [];
    for (var i = 0; i < arguments.length; ++i)
        array.push(arguments[i]);
    this.f = {a:a, b:b, c:array};
}

function bar(array) {
    return new Foo(...array);
}

noInline(bar);

function checkEqual(a, b) {
    if (a.a != b.a)
        throw "Error: bad value of a: " + a.a + " versus " + b.a;
    if (a.b != b.b)
        throw "Error: bad value of b: " + a.b + " versus " + b.b;
    if (a.c.length != b.c.length)
        throw "Error: bad value of c, length mismatch: " + a.c + " versus " + b.c;
    for (var i = a.c.length; i--;) {
        if (a.c[i] != b.c[i])
            throw "Error: bad value of c, mismatch at i = " + i + ": " + a.c + " versus " + b.c;
    }
}

function test(array) {
    var expected = {a:array[0], b:array[1], c:array};
    var actual = bar(array).f;
    checkEqual(actual, expected);
}

for (var i = 0; i < 10000; ++i) {
    var array = [];
    for (var j = 0; j < i % 6; ++j)
        array.push(j);
    test(array);
}

