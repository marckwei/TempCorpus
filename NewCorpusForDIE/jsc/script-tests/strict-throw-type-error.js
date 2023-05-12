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

description("ThrowTypeError is a singleton object");

function getter(object, name)
{
    Object.getOwnPropertyDescriptor(object, name).get;
}

function strictArgumentsFunction1()
{
    "use strict";
    return arguments;
}
var strictArguments1 = strictArgumentsFunction1();
var boundFunction1 = strictArgumentsFunction1.bind();
var functionCaller1 = getter(strictArgumentsFunction1.__proto__, "caller");
var functionArguments1 = getter(strictArgumentsFunction1.__proto__, "arguments");
var argumentsCaller1 = Object.getOwnPropertyDescriptor(strictArguments1, "caller");
var argumentsCallee1 = getter(strictArguments1, "callee");
var boundCaller1 = Object.getOwnPropertyDescriptor(boundFunction1, "caller");
var boundArguments1 = Object.getOwnPropertyDescriptor(boundFunction1, "arguments");

function strictArgumentsFunction2()
{
    "use strict";
    return arguments;
}
var strictArguments2 = strictArgumentsFunction2();
var boundFunction2 = strictArgumentsFunction2.bind();
var functionCaller2 = getter(strictArgumentsFunction2.__proto__, "caller");
var functionArguments2 = getter(strictArgumentsFunction2.__proto__, "arguments");
var argumentsCaller2 = Object.getOwnPropertyDescriptor(strictArguments2, "caller");
var argumentsCallee2 = getter(strictArguments2, "callee");
var boundCaller2 = Object.getOwnPropertyDescriptor(boundFunction2, "caller");
var boundArguments2 = Object.getOwnPropertyDescriptor(boundFunction2, "arguments");

shouldBeTrue('functionCaller1 === functionCaller2');

shouldBeTrue('functionCaller1 === functionArguments1');
shouldBe('argumentsCaller1', 'undefined');
shouldBeTrue('functionCaller1 === argumentsCallee1');
shouldBe('boundCaller1', 'undefined');
shouldBe('boundArguments1', 'undefined');

shouldBeTrue('functionCaller2 === functionArguments2');
shouldBe('argumentsCaller2', 'undefined');
shouldBeTrue('functionCaller2 === argumentsCallee2');
shouldBe('boundCaller2', 'undefined');
shouldBe('boundArguments2', 'undefined');

successfullyParsed = true;
