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

"use strict";

description('Tests ES6 %ThrowTypeError% intrinsic is unique');

class ThrowTypeErrorSource {
    constructor(context, base, names)
    {
        this.context = context;
        this.base = base;
        this.names = names;
    }

    checkTypeErrorFunctions(throwTypeErrorFunction)
    {
        let errors = 0;
        for (let name of this.names) {
            let desc = Object.getOwnPropertyDescriptor(this.base, name);

            if (!desc)
                return 0;

            for (let accessorType of ["get", "set"]) {
                let accessor = desc[accessorType];
                if (accessor && accessor !== throwTypeErrorFunction) {
                    testFailed(this.context + " " + accessorType + "ter for \"" + name + "\" is not the same %ThrowTypeError% intrinsic");
                    errors++;
                }
            }
        }

        return errors;
    }
}

class A { };
let arrayProtoPush = Array.prototype.push;

function strictArguments()
{
    return arguments;
}

let sloppyArguments = Function("return arguments;");

function test()
{
    let baseThrowTypeErrorFunction = Object.getOwnPropertyDescriptor(arguments, "callee").get;

    let sources = [
        new ThrowTypeErrorSource("Strict arguments", strictArguments(), ["callee"]),
        new ThrowTypeErrorSource("Sloppy arguments", sloppyArguments(), ["callee"]),
    ];

    let errors = 0;

    for (let source of sources)
        errors += source.checkTypeErrorFunctions(baseThrowTypeErrorFunction);

    if (!errors)
        testPassed("%ThrowTypeError% intrinsic is unique");
}

test();
