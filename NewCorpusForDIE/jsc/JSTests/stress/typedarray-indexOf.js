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

load("./resources/typedarray-test-helper-functions.js", "caller relative");
description(
"This test checks the behavior of the TypedArray.prototype.indexOf function"
);

shouldBe("Int32Array.prototype.indexOf.length", "1");
shouldBe("Int32Array.prototype.indexOf.name", "'indexOf'");
shouldBeTrue("isSameFunctionForEachTypedArrayPrototype('indexOf')");
shouldBeTrue("testPrototypeReceivesArray('indexOf', [undefined, this, { }, [ ], true, ''])");
debug("");

debug("testPrototypeFunction has the following arg list (name, args, init, result [ , expectedArray ])");
debug("");

function keepEven(e, i) {
    return !(e & 1) || (this.keep ? this.keep === i : false);
}

var array = [2, 5, 9, 2]

shouldBeTrue("testPrototypeFunction('indexOf', '(2, -500)', array, 0)");
shouldBeTrue("testPrototypeFunction('indexOf', '(9, 500)', array, -1)");
shouldBeTrue("testPrototypeFunction('indexOf', '(2)', array, 0)");
shouldBeTrue("testPrototypeFunction('indexOf', '(7)', array, -1)");
shouldBeTrue("testPrototypeFunction('indexOf', '(2, 3)', array, 3)");
shouldBeTrue("testPrototypeFunction('indexOf', '(2, 2)', array, 3)");
shouldBeTrue("testPrototypeFunction('indexOf', '(2, 0)', array, 0)");
shouldBeTrue("testPrototypeFunction('indexOf', '(2, -1)', array, 3)");
shouldBeTrue("testPrototypeFunction('indexOf', '(2, -2)', array, 3)");
debug("");

debug("Check object coersion");
for (constructor of typedArrays) {
    a = new constructor([0,2,3]);
    passed = true;

    shouldBe("a.indexOf({ valueOf() { passed = false; return 1; }})", "-1");
    shouldBeTrue("passed");
    shouldBe("a.indexOf(3, {valueOf: () => -1})", "2");

    // test we don't coerce non-native values
    shouldBe("a.indexOf(\"abc\")", "-1");
    shouldBe("a.indexOf(null)", "-1");
    shouldBe("a.indexOf(undefined)", "-1");
    shouldBe("a.indexOf({1: ''})", "-1");
    shouldBe("a.indexOf(\"\")", "-1");

    shouldBe("a.indexOf(undefined, { valueOf() { transferArrayBuffer(a.buffer); return 0; } })", "-1");
    shouldThrow("a.indexOf(undefined)");
}


for (constructor of intArrays) {
    a = new constructor([0,2,3]);

    shouldBe("a.indexOf(2.0)", "1");
    shouldBe("a.indexOf(2.5)", "-1");
}

for (constructor of floatArrays) {
    a = new constructor([0,2.0,3.6, NaN, Infinity]);

    shouldBe("a.indexOf(2.0)", "1");
    shouldBe("a.indexOf(2.5)", "-1");
    shouldBe("a.indexOf(3.600001)", "-1");
    shouldBe("a.indexOf(NaN)", "-1");
    shouldBe("a.indexOf(Infinity)", "4");
}

finishJSTest();
