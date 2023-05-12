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

var returnTypeFor = $vm.returnTypeFor;

load("./driver/driver.js");

function foo(x) { return x; }
function Ctor() { 
    if (!(this instanceof Ctor))
        return "Not called with `new`"; 
}

// ====== End test cases ======

foo(20);
var types = returnTypeFor(foo);
assert(types.globalTypeSet.displayTypeName === T.Integer, "Function 'foo' should return 'Integer'");

foo(20.5);
types = returnTypeFor(foo);
assert(types.globalTypeSet.displayTypeName === T.Number, "Function 'foo' should return 'Number' after being called twice");

foo("hello");
types = returnTypeFor(foo);
assert(types.globalTypeSet.displayTypeName === T.Many, "Function 'foo' should return '(many)' after being called three times");
assert(types.globalTypeSet.primitiveTypeNames.indexOf(T.String) !== -1, "Function 'foo' should have returned 'String' at some point");
assert(types.globalTypeSet.primitiveTypeNames.indexOf(T.Integer) !== -1, "Function 'foo' should have returned 'Integer' at some point");
assert(types.globalTypeSet.primitiveTypeNames.indexOf(T.Number) !== -1, "Function 'foo' should have returned 'Number' at some point");

new Ctor;
types = returnTypeFor(Ctor);
assert(types.globalTypeSet.displayTypeName === "Ctor", "Function 'Ctor' should return 'Ctor'");
assert(types.globalTypeSet.structures.length === 1, "Function 'Ctor' should have seen one structure");

Ctor();
types = returnTypeFor(Ctor);
assert(types.globalTypeSet.displayTypeName === "Object", "Function 'Ctor' should return Object");
assert(types.globalTypeSet.primitiveTypeNames.indexOf(T.String) !== -1, "Function 'Ctor' should return String");
