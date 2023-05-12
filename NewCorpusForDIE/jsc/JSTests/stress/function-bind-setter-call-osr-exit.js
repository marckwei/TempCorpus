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

myObj = {
    val: 1
}

var result = 0;
function bar(a, idx)
{
    "use strict";

    if (idx == 9900)
        myObj.dfgOSR = "Test";

    if (idx == 199900)
        myObj.ftlOSR = "Test";

    return myObj.val + a;
}

var counter = 0;
function foo(a)
{
    "use strict";

    result = bar(a, counter++);
}

boundFoo = foo.bind(null, 41);

var object = {};
Object.defineProperty(object, 'setter', {
    set: boundFoo,
});

function test()
{
    for (var i = 0; i < 200000; i++) {
        object.setter = i;
        if (result != 42)
            testFailed("Function returned " + got + " but expected 42!");
    }
}

noInline(test);

test();
