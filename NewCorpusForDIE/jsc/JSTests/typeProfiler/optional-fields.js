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

var findTypeForExpression =  $vm.findTypeForExpression;

load("./driver/driver.js");

var func;
function wrapper() {

func = function(arg){};

}
wrapper();

// ====== End test cases ======

var obj = {x:20, y:50};

func(obj);
var types = findTypeForExpression(wrapper, "arg"); 
assert(types.instructionTypeSet.structures.length === 1, "arg should have one structure");
assert(types.instructionTypeSet.structures[0].fields.length === 2, "arg should have two fields");
assert(types.instructionTypeSet.structures[0].fields.indexOf("x") !== -1, "arg should have field: 'x'");
assert(types.instructionTypeSet.structures[0].fields.indexOf("y") !== -1, "arg should have field: 'y'");
assert(types.instructionTypeSet.structures[0].optionalFields.length === 0, "arg should have zero optional fields");

obj.z = 40;
func(obj);
types = findTypeForExpression(wrapper, "arg"); 
assert(types.instructionTypeSet.structures[0].fields.length === 2, "arg should still have two fields");
assert(types.instructionTypeSet.structures[0].fields.indexOf("x") !== -1, "arg should have field: 'x'");
assert(types.instructionTypeSet.structures[0].fields.indexOf("y") !== -1, "arg should have field: 'y'");
assert(types.instructionTypeSet.structures[0].optionalFields.length === 1, "arg should have one optional field");
assert(types.instructionTypeSet.structures[0].optionalFields.indexOf("z") !== -1, "arg should have optional field: 'z'");

obj["foo"] = "type";
obj["baz"] = "profiler";
func(obj);
types = findTypeForExpression(wrapper, "arg"); 
assert(types.instructionTypeSet.structures[0].fields.length === 2, "arg should still have two fields");
assert(types.instructionTypeSet.structures[0].fields.indexOf("x") !== -1, "arg should have field: 'x'");
assert(types.instructionTypeSet.structures[0].fields.indexOf("y") !== -1, "arg should have field: 'y'");
assert(types.instructionTypeSet.structures[0].optionalFields.length === 3, "arg should have three optional field");
assert(types.instructionTypeSet.structures[0].optionalFields.indexOf("z") !== -1, "arg should have optional field: 'z'");
assert(types.instructionTypeSet.structures[0].optionalFields.indexOf("foo") !== -1, "arg should have optional field: 'foo'");
assert(types.instructionTypeSet.structures[0].optionalFields.indexOf("baz") !== -1, "arg should have optional field: 'baz'");

func({});
types = findTypeForExpression(wrapper, "arg"); 
assert(types.instructionTypeSet.structures[0].fields.length === 0, "arg should have no common fields");
assert(types.instructionTypeSet.structures[0].optionalFields.length === 5, "arg should have five optional field");
assert(types.instructionTypeSet.structures[0].optionalFields.indexOf("x") !== -1, "arg should have optional field: 'x'");
assert(types.instructionTypeSet.structures[0].optionalFields.indexOf("y") !== -1, "arg should have optional field: 'y'");
assert(types.instructionTypeSet.structures[0].optionalFields.indexOf("z") !== -1, "arg should have optional field: 'z'");
assert(types.instructionTypeSet.structures[0].optionalFields.indexOf("foo") !== -1, "arg should have optional field: 'foo'");
assert(types.instructionTypeSet.structures[0].optionalFields.indexOf("baz") !== -1, "arg should have optional field: 'baz'");
