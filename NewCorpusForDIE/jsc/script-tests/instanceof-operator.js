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
"instanceof test"
);

getterCalled = false;
try {
    ({} instanceof { get prototype(){ getterCalled = true; } });
} catch (e) {
}
shouldBeFalse("getterCalled");

// Regression test for <https://webkit.org/b/129768>.
// This test should not crash.
function dummyFunction() {}
var c = dummyFunction.bind();

function foo() {
    // To reproduce the issue of <https://webkit.org/b/129768>, we need to do
    // an instanceof test against an object that has the following attributes:
    // ImplementsHasInstance, and OverridesHasInstance.  A bound function fits
    // the bill.
    var result = c instanceof c;

    // This is where the op_check_has_instance bytecode jumps to after the
    // instanceof test. At this location, we need the word at offset 1 to be
    // a ridiculously large value that can't be a valid stack register index.
    // To achieve that, we use an op_loop_hint followed by any other bytecode
    // instruction. The op_loop_hint takes up exactly 1 word, and the word at
    // offset 1 that follows after is the opcode of the next instruction.  In
    // the LLINT, that opcode value will be a pointer to the opcode handler
    // which will be large and exactly what we need.  Hence, we plant a loop
    // here for the op_loop_hint, and have some instruction inside the loop.
    while (true) {
        var dummy2 = 123456789;
        break;
    }
    return result;
}

shouldBeFalse("foo()");

