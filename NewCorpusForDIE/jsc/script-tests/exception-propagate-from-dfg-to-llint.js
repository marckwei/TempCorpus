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

description("Ensures that we pass exceptions to the correct codeblock when throwing from the DFG to the LLInt.");
var o = {
    toString: function() { if (shouldThrow) throw {}; return ""; }
};

var shouldThrow = false;
function h(o) {
    return String(o);
}

try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}
try { shouldThrow = !shouldThrow; h(o); } catch (e) {}


function g() {
    with({})
        h(o);
}

function f1() {
    try {
        g();
    } catch (e) {
        testFailed("Caught exception in wrong codeblock");
    }
}

function f2() {
    try {
        g();
    } catch (e) {
        testPassed("Caught exception in correct codeblock");
    }
}

f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
f1();
shouldThrow = true;
f2();
var successfullyParsed = true;
