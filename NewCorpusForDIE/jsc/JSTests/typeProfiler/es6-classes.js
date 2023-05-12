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

let changeFoo;
let tdzError;
let scoping;
let scoping2;
function noop(){}

function wrapper() {
    class Animal {
        constructor() { }
        methodA() {}
    }
    class Dog extends Animal {
        constructor() { super() }
        methodB() {}
    }

    let dogInstance = new Dog;
    const animalInstance = new Animal;
}
wrapper();

// ====== End test cases ======

var types = findTypeForExpression(wrapper, "dogInstance =");
assert(types.globalTypeSet.displayTypeName === "Dog", "Should show constructor name");
assert(types.globalTypeSet.structures[0].constructorName === "Dog", "Should be Dog");
assert(types.globalTypeSet.structures[0].proto.fields.length === 2, "should have two fields");
assert(types.globalTypeSet.structures[0].proto.fields.indexOf("constructor") !== -1, "should have constructor");
assert(types.globalTypeSet.structures[0].proto.fields.indexOf("methodB") !== -1, "should have methodB");

types = findTypeForExpression(wrapper, "animalInstance =");
assert(types.globalTypeSet.displayTypeName === "Animal", "Should show constructor name");
assert(types.globalTypeSet.structures.length === 1, "should have one structure");
assert(types.globalTypeSet.structures[0].constructorName === "Animal", "Should be Animal");
assert(types.globalTypeSet.structures[0].proto.fields.length === 2, "should have two fields");
assert(types.globalTypeSet.structures[0].proto.fields.indexOf("constructor") !== -1, "should have constructor");
assert(types.globalTypeSet.structures[0].proto.fields.indexOf("methodA") !== -1, "should have methodA");
