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
"Tests that a dead use of Math.min(a,b) at least speculates that its arguments are indeed numbers."
);

function foo(a, b) {
    Math.min(a.f, b.f);
    return 100;
}

function bar(a, b) {
    Math.min(a.f, b.f);
    return 100;
}

var x = {f:42};
var y = {f:43};
var ok = null;
var expected = 42;
var empty = "";

silentTestPass = true;
noInline(foo);
noInline(bar);

for (var i = 0; i < 200; i = dfgIncrement({f:foo, i: i + 1, n: 100})) {
    if (i == 150) {
        x = {f:{valueOf:function(){ ok = i; return 37; }}};
        expected = 37;
    }
    var result = eval(empty + "foo(x, y)");
    if (i >= 150)
        shouldBe("ok", "" + i);
    shouldBe("result", "100");
}

x = {f:42};
y = {f:43};
ok = null;
expected = 42;

for (var i = 0; i < 200; i = dfgIncrement({f:bar, i:i + 1, n:100})) {
    if (i == 150) {
        y = {f:{valueOf:function(){ ok = i; return 37; }}};
        expected = 37;
    }
    var result = eval(empty + "bar(x, y)");
    if (i >= 150)
        shouldBe("ok", "" + i);
    shouldBe("result", "100");
}

