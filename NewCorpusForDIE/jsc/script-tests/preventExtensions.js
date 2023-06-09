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

description(
"This test checks whether various seal/freeze/preventExtentions work on a regular object."
);

function obj()
{
    // Add an accessor property to check 'isFrozen' returns the correct result for objects with accessors.
    return Object.defineProperty({ a: 1, b: 2 }, 'g', { get: function() { return "getter"; } });
}

function test(obj)
{
    obj.c =3;
    obj.b =4;
    delete obj.a;

    var result = "";
    for (key in obj)
        result += ("(" + key + ":" + obj[key] + ")");
    if (Object.isSealed(obj))
        result += "S";
    if (Object.isFrozen(obj))
        result += "F";
    if (Object.isExtensible(obj))
        result += "E";
    return result;
}

function seal(obj)
{
    Object.seal(obj);
    return obj;
}

function freeze(obj)
{
    Object.freeze(obj);
    return obj;
}

function preventExtensions(obj)
{
    Object.preventExtensions(obj);
    return obj;
}

function inextensible(){}
function sealed(){}
function frozen(){};
preventExtensions(inextensible);
seal(sealed);
freeze(frozen);
new inextensible;
new sealed;
new frozen;
inextensible.prototype.prototypeExists = true;
sealed.prototype.prototypeExists = true;
frozen.prototype.prototypeExists = true;

shouldBeTrue("(new inextensible).prototypeExists");
shouldBeTrue("(new sealed).prototypeExists");
shouldBeTrue("(new frozen).prototypeExists");

shouldBe('test(obj())', '"(b:4)(c:3)E"'); // extensible, can delete a, can modify b, and can add c
shouldBe('test(preventExtensions(obj()))', '"(b:4)"'); // <nothing>, can delete a, can modify b, and CANNOT add c
shouldBe('test(seal(obj()))', '"(a:1)(b:4)S"'); // sealed, CANNOT delete a, can modify b, and CANNOT add c
shouldBe('test(freeze(obj()))', '"(a:1)(b:2)SF"'); // sealed and frozen, CANNOT delete a, CANNOT modify b, and CANNOT add c

// check that we can preventExtensions on a host function.
shouldBe('Object.preventExtensions(Math.sin)', 'Math.sin');

shouldThrow('var o = {}; Object.preventExtensions(o); o.__proto__ = { newProp: "Should not see this" }; o.newProp;');
shouldThrow('"use strict"; var o = {}; Object.preventExtensions(o); o.__proto__ = { newProp: "Should not see this" }; o.newProp;');

// check that we can still access static properties on an object after calling preventExtensions.
shouldBe('Object.preventExtensions(Math); Math.sqrt(4)', '2');

// Should not be able to add properties to a preventExtensions array.
shouldBeUndefined('var arr = Object.preventExtensions([]); arr[0] = 42; arr[0]');
shouldBe('var arr = Object.preventExtensions([]); arr[0] = 42; arr.length', '0');
// In strict mode, this throws.
shouldThrow('"use strict"; var arr = Object.preventExtensions([]); arr[0] = 42; arr[0]');

// A read-only property on the prototype should prevent a [[Put]] .
function Constructor() {}
Constructor.prototype.foo = 1;
Object.freeze(Constructor.prototype);
var obj = new Constructor();
obj.foo = 2;
shouldBe('obj.foo', '1');

// Check that freezing a function works correctly.
var func = freeze(function foo(){});
shouldBeTrue('Object.isFrozen(func)')
func.prototype = 42;
shouldBeFalse('func.prototype === 42');
shouldBeFalse('Object.getOwnPropertyDescriptor(func, "prototype").writable')

// Check that freezing a strict function works correctly.
var strictFunc = freeze(function foo(){ "use strict"; });
shouldBeTrue('Object.isFrozen(strictFunc)')
strictFunc.prototype = 42;
shouldBeFalse('strictFunc.prototype === 42');
shouldBeFalse('Object.getOwnPropertyDescriptor(strictFunc, "prototype").writable')

// Check that freezing array objects works correctly.
var array = freeze([0,1,2]);
shouldBeTrue('Object.isFrozen(array)')
array[0] = 3;
shouldBe('array[0]', '0');
shouldBeFalse('Object.getOwnPropertyDescriptor(array, "length").writable')

// Check that freezing arguments objects works correctly.
var args = freeze((function(){ return arguments; })(0,1,2));
shouldBeTrue('Object.isFrozen(args)')
args[0] = 3;
shouldBe('args[0]', '0');
shouldBeFalse('Object.getOwnPropertyDescriptor(args, "length").writable')
shouldBeFalse('Object.getOwnPropertyDescriptor(args, "callee").writable')

// Check that freeze still works if preventExtensions has been called on the object.
function preventExtensionsFreezeIsFrozen(x)
{
    Object.preventExtensions(x);
    Object.freeze(x);
    return Object.isFrozen(x);
}
shouldBeTrue('preventExtensionsFreezeIsFrozen(function foo(){})')
shouldBeTrue('preventExtensionsFreezeIsFrozen(function foo(){ "use strict"; })')
shouldBeTrue('preventExtensionsFreezeIsFrozen([0,1,2])')
shouldBeTrue('preventExtensionsFreezeIsFrozen((function(){ return arguments; })(0,1,2))')

shouldBeFalse('Object.getOwnPropertyDescriptor(freeze({0:0}), 0).configurable');
shouldBeFalse('Object.getOwnPropertyDescriptor(freeze({10000001:0}), 10000001).configurable');
