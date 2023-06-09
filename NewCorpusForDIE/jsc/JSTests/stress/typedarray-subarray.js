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

load("./resources/typedarray-test-helper-functions.js", "caller relative");
description(
"This test checks the behavior of the TypedArray.prototype.subarray function"
);

shouldBe("Int32Array.prototype.subarray.length", "2");
shouldBe("Int32Array.prototype.subarray.name", "'subarray'");
shouldBeTrue("isSameFunctionForEachTypedArrayPrototype('subarray')");
shouldBeTrue("testPrototypeReceivesArray('subarray', [undefined, this, { }, [ ], true, ''])");
debug("");

debug("1.0 Symbol.species Test");
subclasses = typedArrays.map(function(constructor) { return class extends constructor { } } );

function testSpecies(array, constructor) {
    let newArray = array.subarray(0, 0);
    return newArray instanceof constructor;
}
shouldBeTrue("forEachTypedArray(subclasses, testSpecies)");

Foo = class extends Int32Array { }
subclasses.forEach(function(constructor) { Object.defineProperty(constructor, Symbol.species, { value:Foo, writable:true }); });
function testSpeciesWithFoo(array, constructor) {
    let newArray = array.subarray(0, 0);
    return newArray instanceof Foo;
}
shouldBeTrue("forEachTypedArray(subclasses, testSpeciesWithFoo)");
debug("");

debug("4.1 Symbol.species Test throws");
subclasses.forEach(function(constructor) { Object.defineProperty(constructor, Symbol.species, { value:1, writable:true }); });
shouldThrow("forEachTypedArray(subclasses, testSpecies)");

subclasses.forEach(function(constructor) { constructor[Symbol.species] = Array; });
shouldThrow("forEachTypedArray(subclasses, testSpecies)");
debug("");

debug("4.2 Symbol.species Test with Defaults");
subclasses.forEach(function(constructor) { constructor[Symbol.species] = null; });
function testSpeciesIsDefault(array, constructor) {
    let newArray = array.subarray(0, 0);
    let defaultConstructor = typedArrays[subclasses.indexOf(constructor)];
    return newArray instanceof defaultConstructor;
}

shouldBeTrue("forEachTypedArray(subclasses, testSpeciesIsDefault)");

subclasses.forEach(function(constructor) { constructor[Symbol.species] = undefined; });
shouldBeTrue("forEachTypedArray(subclasses, testSpeciesIsDefault)");

subclasses.forEach(function(constructor) { constructor[Symbol.species] = () => new DataView(new ArrayBuffer()); });
function testSpeciesReturnsDataView(array, constructor) {
    try {
        array.subarray(0, 0);
    } catch (e) {
        return e instanceof TypeError;
    }
    return false;
}
shouldBeTrue("forEachTypedArray(subclasses, testSpeciesReturnsDataView)");

subclasses = typedArrays.map(function(constructor) { return class extends constructor { } } );
function testSpeciesRemoveConstructor(array, constructor) {
    array.constructor = undefined;
    let newArray = array.subarray(0, 0);
    let defaultConstructor = typedArrays[subclasses.indexOf(constructor)];
    return newArray instanceof defaultConstructor;
}

shouldBeTrue("forEachTypedArray(subclasses, testSpeciesRemoveConstructor)");

debug("5.0 Coercion First Argument");
shouldBeTrue("testPrototypeFunction('subarray', '(true)', [1, 2, 3, 4], [2, 3, 4])");
shouldBeTrue("testPrototypeFunction('subarray', '(\"abc\")', [1, 2, 3, 4], [1, 2, 3, 4])");
shouldBeTrue("testPrototypeFunction('subarray', '({ valueOf() { return Infinity; } })', [1, 2, 3, 4], [])");
shouldBeTrue("testPrototypeFunction('subarray', '({ valueOf() { return -0; } })', [1, 2, 3, 4], [1, 2, 3, 4])");
shouldBeTrue("testPrototypeFunction('subarray', '(null)', [1, 2, 3, 4], [1, 2, 3, 4])");
shouldBeTrue("testPrototypeFunction('subarray', '(undefined)', [1, 2, 3, 4], [1, 2, 3, 4])");

debug("5.1 Coercion Second Argument");
shouldBeTrue("testPrototypeFunction('subarray', '(0, true)', [1, 2, 3, 4], [1])");
shouldBeTrue("testPrototypeFunction('subarray', '(0, \"abc\")', [1, 2, 3, 4], [])");
shouldBeTrue("testPrototypeFunction('subarray', '(0, \"1\")', [1, 2, 3, 4], [1])");
shouldBeTrue("testPrototypeFunction('subarray', '(0, undefined)', [1, 2, 3, 4], [1, 2, 3, 4])");
shouldBeTrue("testPrototypeFunction('subarray', '(0, { valueOf() { return Infinity; } })', [1, 2, 3, 4], [1, 2, 3, 4])");
shouldBeTrue("testPrototypeFunction('subarray', '(0, { valueOf() { return -0; } })', [1, 2, 3, 4], [])");
shouldBeTrue("testPrototypeFunction('subarray', '(0, null)', [1, 2, 3, 4], [])");

finishJSTest();
