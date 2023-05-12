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

//@ skip if $architecture == "x86"

var createBuiltin = $vm.createBuiltin;
var iterationCount = 100000;

// This is pretty bad but I need a private name.
var putFuncToPrivateName = createBuiltin(`(function (func) { @generatorThis = func })`)

function createTailCallForwardingFuncWith(body, thisValue) {
    return createBuiltin(`(function (a) {
        "use strict";

        ${body}

        return @tailCallForwardArguments(@generatorThis, ${thisValue});
    })`);
}

putFuncToPrivateName(function () { "use strict"; return this;  });
let bodyText = `
for (let i = 0; i < 100; i++) {
    if (a + i === 100)
        return a;
}
`;
var foo4 = createTailCallForwardingFuncWith(bodyText, "{ thisValue: this, otherValue: 'hello'} ");
var fooNI4 = createTailCallForwardingFuncWith(bodyText, "{ thisValue: this, otherValue: 'hello'} ");
noInline(fooNI4);
function baz4() {
    return foo4.call(true, 0);
}
noInline(baz4);

for (let i = 0; i < iterationCount; i++) {
    let result = foo4.call(true, 0);
    if (result.thisValue !== true || result.otherValue !== "hello")
        throw new Error(i);
    result = baz4.call();
    if (result.thisValue !== true || result.otherValue !== "hello")
        throw new Error(i);
    result = fooNI4.call(true, 0);
    if (result.thisValue !== true || result.otherValue !== "hello")
        throw new Error(i);
    result = fooNI4.call(true, 1);
    if (result !== 1)
        throw new Error(i);
    result = fooNI4.call(true, "");
    if (result.thisValue !== true || result.otherValue !== "hello")
        throw new Error(i);
}
