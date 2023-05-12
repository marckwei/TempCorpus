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

function foo(a, b) {
    return a + b;
}

function verify(a, b) {
    if (a !== b)
        throw "Error: the two arguments objects aren't identical.";
}

noInline(verify);

function bar() {
    var a = arguments;
    this.verify(arguments, a);
    return foo.apply(null, a);
}

function baz(a, b) {
    return this.bar(a + 1, b + 1);
}

noInline(baz);

for (var i = 0; i < 20000; ++i) {
    var o = {
        baz: baz,
        bar: bar,
        verify: function() { }
    };
    var result = o.baz(1, 2);
    if (result != 1 + 1 + 2 + 1)
        throw "Error: bad result: " + result;
}

var o = {
    baz: baz,
    bar: bar,
    verify: verify
};
var result = o.baz(1, 2);
if (result != 1 + 1 + 2 + 1)
    throw "Error: bad result at end: " + result;
