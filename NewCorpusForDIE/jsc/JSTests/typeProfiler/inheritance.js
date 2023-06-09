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

function A() { };
function B() { };
function C() { };

var theA = new A;
var theB = new B;
var theC = new C;
var hierarchyTest = new B;
hierarchyTest = new C;

var secondHierarchyTest = Object.create(theB);
secondHierarchyTest = Object.create(theC);

var secondB = Object.create(theB);

B.prototype.__proto__ = A.prototype;
C.prototype.__proto__ = A.prototype;

}
wrapper();

// ====== End test cases ======

types = findTypeForExpression(wrapper, "theA = n");
assert(types.globalTypeSet.displayTypeName === "A", "variable 'theA' should have displayTypeName 'A'");
assert(types.instructionTypeSet.displayTypeName === "A", "variable 'theA' should have displayTypeName 'A'");

types = findTypeForExpression(wrapper, "theB = n");
assert(types.globalTypeSet.displayTypeName === "B", "variable 'theB' should have displayTypeName 'B'");
assert(types.instructionTypeSet.displayTypeName === "B", "variable 'theB' should have displayTypeName 'B'");

types = findTypeForExpression(wrapper, "theC = n");
assert(types.globalTypeSet.displayTypeName === "C", "variable 'theC' should have displayTypeName 'C'");
assert(types.instructionTypeSet.displayTypeName === "C", "variable 'theC' should have displayTypeName 'C'");

types = findTypeForExpression(wrapper, "hierarchyTest = new B;");
assert(types.globalTypeSet.displayTypeName === "A", "variable 'hierarchyTest' should have displayTypeName 'A'");

types = findTypeForExpression(wrapper, "hierarchyTest = new C;");
assert(types.globalTypeSet.displayTypeName === "A", "variable 'hierarchyTest' should have displayTypeName 'A'");

types = findTypeForExpression(wrapper, "secondHierarchyTest = Object.create(theB);");
assert(types.globalTypeSet.displayTypeName === "A", "variable 'secondHierarchyTest' should have displayTypeName 'A'");

types = findTypeForExpression(wrapper, "secondHierarchyTest = Object.create(theC);");
assert(types.globalTypeSet.displayTypeName === "A", "variable 'secondHierarchyTest' should have displayTypeName 'A'");

types = findTypeForExpression(wrapper, "secondB");
assert(types.globalTypeSet.displayTypeName === "B", "variable 'secondB' should have displayTypeName 'B'");
