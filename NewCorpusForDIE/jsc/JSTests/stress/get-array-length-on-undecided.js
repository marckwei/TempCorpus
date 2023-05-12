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

function forceTransition() {
    // We want to test the StructureCheck in testSparseArray(), not this watchpoint.
    // We start with the transition so that it's nothing new.
    let array = new Array();
    array[100001] = "WebKit!";
}
forceTransition();

function opaqueGetArrayLength(array)
{
    return array.length;
}
noInline(opaqueGetArrayLength);

function testEmptyArray()
{
    let array = [];
    for (let i = 0; i < 1e6; ++i) {
        if (opaqueGetArrayLength(array) !== 0) {
            throw "Failed testEmptyArray";
        }
    }

    array = new Array();
    for (let i = 0; i < 1e6; ++i) {
        if (opaqueGetArrayLength(array) !== 0) {
            throw "Failed testEmptyArray";
        }
    }
}
testEmptyArray();


function testUnitializedArray()
{
    let array = new Array(32);
    for (let i = 0; i < 1e6; ++i) {
        if (opaqueGetArrayLength(array) !== 32) {
            throw "Failed testUnitializedArray";
        }
    }

    array = new Array();
    array.length = 64
    for (let i = 0; i < 1e6; ++i) {
        if (opaqueGetArrayLength(array) !== 64) {
            throw "Failed testUnitializedArray";
        }
    }
}
testUnitializedArray();

function testOversizedArray()
{
    let array = new Array(100001);
    for (let i = 0; i < 1e6; ++i) {
        if (opaqueGetArrayLength(array) !== 100001) {
            throw "Failed testOversizedArray";
        }
    }
}
testOversizedArray();

// This should OSR Exit and fallback to GetById to get the length.
function testSparseArray()
{
    let array = new Array();
    array[100001] = "WebKit!";
    for (let i = 0; i < 1e6; ++i) {
        if (opaqueGetArrayLength(array) !== 100002) {
            throw "Failed testOversizedArray";
        }
    }
}
testSparseArray();

