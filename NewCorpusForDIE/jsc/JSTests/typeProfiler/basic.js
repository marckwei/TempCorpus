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

function foo(bar){}
foo(20);
foo(20.5);

var test = {x:20, y:50};
test = "hello";

}
wrapper();

// ====== End test cases ======

var types = findTypeForExpression(wrapper, "bar)"); 
assert(types.instructionTypeSet.primitiveTypeNames.indexOf(T.Integer) !== -1, "Primitive type names should contain 'Integer'");
assert(types.instructionTypeSet.primitiveTypeNames.indexOf(T.Number) !== -1, "Primitive type names should contain 'Number'");
assert(types.instructionTypeSet.displayTypeName === T.Number , "Primitive type names display name should be 'Number'");

types = findTypeForExpression(wrapper, "test = {"); 
assert(types.globalTypeSet.primitiveTypeNames.indexOf(T.String) !== -1, "Variable 'test' should have been type 'String' globally");
assert(types.instructionTypeSet.structures.length === 1, "Variable 'test' should have one structure");
assert(types.instructionTypeSet.structures[0].constructorName === "Object", "variable 'test'")
assert(types.instructionTypeSet.structures[0].proto.constructorName === "Object", "Variable 'test' shouldn't have a prototype");
assert(types.instructionTypeSet.structures[0].proto.proto === null, "Variable 'test' shouldn't have a prototype");
assert(types.instructionTypeSet.structures[0].constructorName === "Object", "variable 'test' should have constructor name 'Object'")
assert(types.globalTypeSet.displayTypeName === "Object", "Variable 'test' global type name should display as 'Object'");
assert(types.instructionTypeSet.structures[0].fields.length === 2, "variable 'test' should have two fields: x,y");
assert(types.instructionTypeSet.structures[0].fields.indexOf("x") !== -1, "variable 'test' should have field 'x'");
assert(types.instructionTypeSet.structures[0].fields.indexOf("y") !== -1, "variable 'test' should have field 'y'");

types = findTypeForExpression(wrapper, "test = \"h");
assert(types.globalTypeSet.primitiveTypeNames.indexOf(T.String) !== -1, "Variable 'test' should have been type 'String' globally");
assert(types.instructionTypeSet.displayTypeName === T.String, "Variable 'test' should have been display type 'String' at this instruction");
assert(types.instructionTypeSet.primitiveTypeNames.indexOf(T.String) !== -1, "Variable 'test' should have been type 'String' globally");
assert(types.instructionTypeSet.structures.length === 0, "Variable 'test' at this instruction shouldn't have a structure.");
assert(types.globalTypeSet.structures.length === 1, "Variable 'test' should still have one structure");
assert(types.globalTypeSet.structures[0].fields.indexOf("x") !== -1, "variable 'test' should have field 'x' globally");
assert(types.globalTypeSet.structures[0].fields.indexOf("y") !== -1, "variable 'test' should have field 'y' globally");

