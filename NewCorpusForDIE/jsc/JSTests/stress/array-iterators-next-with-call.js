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

// This test checks the behavior of the %ArrayIteratorPrototype%.next methods with call.

var array = [0, 1, 2, 3, 4];
var arrayIterator = array[Symbol.iterator]();
var arrayIteratorPrototype = arrayIterator.__proto__;
var arrayIteratorPrototypeNext = arrayIteratorPrototype.next;

if (arrayIterator.hasOwnProperty('next'))
    throw "next method should exists on %ArrayIteratorPrototype%";
if (!arrayIteratorPrototype.hasOwnProperty('next'))
    throw "next method should exists on %ArrayIteratorPrototype%";

var array1 = [42, 43, 41];
var array1Iterator = array1[Symbol.iterator]();
var index = 0;
while (true) {
    var result = arrayIteratorPrototypeNext.call(array1Iterator);
    var value = result.value;
    if (result.done) {
        break;
    }
    if (value !== array1[index++])
        throw "Error: bad value: " + value;
}
if (index !== 3)
    throw "Error: bad index: " + index;

function increment(iter) {
    return arrayIteratorPrototypeNext.call(iter);
}
var array1 = [42, 43, -20];
var array2 = [42, 43, -20];
var array1Iterator = array1[Symbol.iterator]();
var array2Iterator = array2[Symbol.iterator]();
for (var i = 0; i < 3; ++i) {
    var value1 = increment(array1Iterator).value;
    var value2 = increment(array2Iterator).value;
    if (value1 !== value2)
        throw "Error: bad value: " + value1 + " " + value2;
}

var array1 = [ 0, 1, 2, 4, 5, 6 ];
var array1Iterator = array1[Symbol.iterator]();

var value = array1Iterator.next().value;
if (value !== 0)
    throw "Error: bad value: " + value;
var value = array1Iterator.next().value;
if (value !== 1)
    throw "Error: bad value: " + value;
var value = array1Iterator.next().value;
if (value !== 2)
    throw "Error: bad value: " + value;
var value = arrayIteratorPrototypeNext.call(array1Iterator).value;
if (value !== 4)
    throw "Error: bad value: " + value;
var value = arrayIteratorPrototypeNext.call(array1Iterator).value;
if (value !== 5)
    throw "Error: bad value: " + value;
var value = arrayIteratorPrototypeNext.call(array1Iterator).value;
if (value !== 6)
    throw "Error: bad value: " + value;
var value = arrayIteratorPrototypeNext.call(array1Iterator).value;
if (value !== undefined)
    throw "Error: bad value: " + value;

var primitives = [
    "string",
    42,
    0.03,
    false,
    true,
    Symbol("Cocoa"),
    null,
    undefined
];
for (var primitive of primitives) {
    var didThrow = null;
    try {
        arrayIteratorPrototypeNext.call(primitive);
    } catch (e) {
        didThrow = e;
    }
    if (!didThrow)
        throw "Error: no error thrown";
    var expectedMessage = 'TypeError: %ArrayIteratorPrototype%.next requires that |this| be an Array Iterator instance';
    if (String(didThrow) !== expectedMessage)
        throw new Error("bad error thrown: " + didThrow + " expected: " + expectedMessage);
}

var nonRelatedObjects = [
    {},
    [],
    new Date(),
    new Error(),
    Object(Symbol()),
    new String("Cappuccino"),
    new Number(42),
    new Boolean(false),
    function () { },
];
for (var object of nonRelatedObjects) {
    var didThrow = null;
    try {
        arrayIteratorPrototypeNext.call(object);
    } catch (e) {
        didThrow = e;
    }
    if (!didThrow)
        throw "Error: no error thrown";
    if (String(didThrow) !== 'TypeError: %ArrayIteratorPrototype%.next requires that |this| be an Array Iterator instance')
        throw new Error("bad error thrown: " + didThrow);
}
