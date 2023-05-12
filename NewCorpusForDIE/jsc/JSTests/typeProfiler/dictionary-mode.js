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

var findTypeForExpression = $vm.findTypeForExpression;

load("./driver/driver.js");

function wrapper()
{

var foo = {};
for (var i = 0; i < 150; i++) {
    foo["hello" + i] = i;
}
var shouldBeInDictionaryMode = foo;

var shouldNotBeInDictionaryMode = {
    "1": 1,
    "2": 2,
    "3": 3
}

}
wrapper();

var types = findTypeForExpression(wrapper, "shouldBeInDictionaryMode"); 
assert(types.globalTypeSet.structures.length === 1, "Should have one structure.");
assert(types.globalTypeSet.structures[0].isInDictionaryMode, "Should be in dictionary mode");

types = findTypeForExpression(wrapper, "shouldNotBeInDictionaryMode"); 
assert(types.globalTypeSet.structures.length === 1, "Should have one structure.");
assert(!types.globalTypeSet.structures[0].isInDictionaryMode, "Should not be in dictionary mode");
