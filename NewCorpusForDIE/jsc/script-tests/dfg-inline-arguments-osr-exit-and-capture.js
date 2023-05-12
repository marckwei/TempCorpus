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
"Tests what happens if you OSR exit within inlined code that has interesting control flow with arguments that are specially formatted and you capture the arguments reflectively after the OSR exit."
);

function foo() {
    return bar.arguments[0];
}

function bar(x, y) {
    if (x + 5 > 4)
        return y.f + 42 + foo();
    else
        return y.f + 43 + foo();
}

function baz(x, y) {
    return bar(x, y);
}

for (var i = 0; i < 300; ++i) {
    var expected;
    var arg1 = i;
    var arg2;
    if (i < 250) {
        arg2 = {f:i + 1};
        expected = i + 1 + 42 + i;
    } else {
        arg2 = {f:1.5};
        expected = 1.5 + 42 + i;
    }
    shouldBe("baz(arg1, arg2)", "" + expected);
}

