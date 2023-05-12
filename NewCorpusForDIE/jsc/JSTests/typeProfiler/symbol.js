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

function wrapper() {
    var s1 = Symbol();

    var sCaptured = Symbol();
    function foo() {
        sCaptured = null;
    }
    foo();

    function bar(s3) { return s3; }
    for (var i = 0; i < 1000; i++)
        bar(i)
    bar(Symbol())

    function baz(s4) { return s4; }
    for (var i = 0; i < 1000; i++)
        baz(Symbol())
    baz("hello")
}

wrapper();

// ====== End test cases ======

var types = findTypeForExpression(wrapper, "s1"); 
assert(types.instructionTypeSet.primitiveTypeNames.length === 1, "Primitive type names should contain one type");
assert(types.instructionTypeSet.primitiveTypeNames.indexOf(T.Symbol) !== -1, "Primitive type names should contain 'Symbol'");

types = findTypeForExpression(wrapper, "sCaptured");
assert(types.globalTypeSet.primitiveTypeNames.length === 2, "Primitive type names should contain two items.");
assert(types.globalTypeSet.primitiveTypeNames.indexOf(T.Symbol) !== -1, "Primitive type names should contain 'Symbol'");
assert(types.globalTypeSet.primitiveTypeNames.indexOf(T.Null) !== -1, "Primitive type names should contain 'Null'");

types = findTypeForExpression(wrapper, "s3");
assert(types.instructionTypeSet.primitiveTypeNames.length === 2, "Primitive type names should contain 2 items");
assert(types.instructionTypeSet.primitiveTypeNames.indexOf(T.Integer) !== -1, "Primitive type names should contain 'Integer'");
assert(types.instructionTypeSet.primitiveTypeNames.indexOf(T.Symbol) !== -1, "Primitive type names should contain 'Symbol'");

types = findTypeForExpression(wrapper, "s4");
assert(types.instructionTypeSet.primitiveTypeNames.length === 2, "Primitive type names should contain 2 items");
assert(types.instructionTypeSet.primitiveTypeNames.indexOf(T.String) !== -1, "Primitive type names should contain 'String'");
assert(types.instructionTypeSet.primitiveTypeNames.indexOf(T.Symbol) !== -1, "Primitive type names should contain 'Symbol'");
