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

var changeFoo;
function wrapper() {

var foo=20;
changeFoo = function(arg) { foo = arg; }

}
wrapper();

// ====== End test cases ======

var types = findTypeForExpression(wrapper, "foo=20;"); 
assert(types.instructionTypeSet.primitiveTypeNames.indexOf(T.Integer) !== -1, "Primitive type names should contain 'Integer'");
assert(types.globalTypeSet.primitiveTypeNames.indexOf(T.Integer) !== -1, "Primitive type names should contain 'Integer'");
assert(types.globalTypeSet.primitiveTypeNames.length === 1, "Primitive type names should contain exactly only one item globally");
assert(types.instructionTypeSet.primitiveTypeNames.length === 1, "Primitive type names should contain exactly only one item on the instruction");
assert(types.globalTypeSet.displayTypeName === T.Integer, "global display name should be Integer");
assert(types.instructionTypeSet.displayTypeName === T.Integer, "instruction display name should be Integer");

changeFoo(20.5);
types = findTypeForExpression(wrapper, "foo=20;"); 
assert(types.instructionTypeSet.primitiveTypeNames.indexOf(T.Integer) !== -1, "Primitive type names should contain 'Integer'");
assert(types.instructionTypeSet.primitiveTypeNames.length === 1, "Primitive type names should contain STILL only contain exactly one item on the instruction");
assert(types.globalTypeSet.primitiveTypeNames.indexOf(T.Integer) !== -1, "Global primitive type names should now still contain 'Integer'");
assert(types.globalTypeSet.primitiveTypeNames.indexOf(T.Number) !== -1, "Global primitive type names should now contain 'Number'");
assert(types.globalTypeSet.primitiveTypeNames.length === 2, "Global primitive type names should contain exactly two items globally");
assert(types.globalTypeSet.displayTypeName === T.Number, "global display name should be Number");

changeFoo(null);

