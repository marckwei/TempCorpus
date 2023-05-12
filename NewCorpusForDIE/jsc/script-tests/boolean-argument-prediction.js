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
"This tests that arguments predicted to be boolean are checked."
);

function predictBooleanArgument(b) {
    if (b) {
        return "yes";
    } else {
        return "no";
    }
}

shouldBe("predictBooleanArgument(true)", "\"yes\"");
shouldBe("predictBooleanArgument(false)", "\"no\"");

for (var i = 0; i < 1000; ++i) {
    predictBooleanArgument(true);
    predictBooleanArgument(false);
}

shouldBe("predictBooleanArgument(true)", "\"yes\"");
shouldBe("predictBooleanArgument(false)", "\"no\"");

shouldBe("predictBooleanArgument(0)", "\"no\"");
shouldBe("predictBooleanArgument(1)", "\"yes\"");
shouldBe("predictBooleanArgument(2)", "\"yes\"");
shouldBe("predictBooleanArgument(3)", "\"yes\"");
shouldBe("predictBooleanArgument(4)", "\"yes\"");

for (var i = 0; i < 1000; ++i) {
    predictBooleanArgument(0);
    predictBooleanArgument(1);
    predictBooleanArgument(2);
    predictBooleanArgument(3);
    predictBooleanArgument(4);
}

shouldBe("predictBooleanArgument(true)", "\"yes\"");
shouldBe("predictBooleanArgument(false)", "\"no\"");

shouldBe("predictBooleanArgument(0)", "\"no\"");
shouldBe("predictBooleanArgument(1)", "\"yes\"");
shouldBe("predictBooleanArgument(2)", "\"yes\"");
shouldBe("predictBooleanArgument(3)", "\"yes\"");
shouldBe("predictBooleanArgument(4)", "\"yes\"");
