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
"This test checks for a couple of specific ways that bugs in toString() round trips have changed the meanings of functions with var declarations inside for loops."
);

function f1() { for (var j in []) {}  }
var f2 = function () { for (var j = 1; j < 10; ++j) {}  }
var f3 = function () { for (j = 1;j < 10; ++j) {}  }
var f4 = function () { for (var j;;) {}  }

var unevalf = function(x) { return '(' + x.toString() + ')'; }

shouldBe("unevalf(eval(unevalf(f1)))", "unevalf(f1)");
shouldBe("unevalf(eval(unevalf(f2)))", "unevalf(f2)");
shouldBe("unevalf(eval(unevalf(f3)))", "unevalf(f3)");
shouldBe("unevalf(eval(unevalf(f4)))", "unevalf(f4)");
shouldBe("unevalf(f2) != unevalf(f3)", "true");
