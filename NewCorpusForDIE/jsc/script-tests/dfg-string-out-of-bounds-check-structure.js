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
"Tests what happens when you do a out-of-bounds access on a string and use that to install a getter that clobbers a structure."
);

function foo(s, o) {
    var x = o.f;
    s[42];
    var y = o.g;
    return x + y;
}

noInline(foo);
silentTestPass = true;

var theObject = {};

var didGetCalled = false;
String.prototype.__defineGetter__("42", function() { didGetCalled = true; delete theObject.g; theObject.h = 42 });

while (testRunner.numberOfDFGCompiles(foo) < 1) {
    didGetCalled = false;
    shouldBe("foo(\"hello\", {f:1, g:2})", "3");
    shouldBe("didGetCalled", "true");
}

theObject = {f:1, g:2};
didGetCalled = false;
shouldBe("foo(\"hello\", theObject)", "0/0");
shouldBe("didGetCalled", "true");
