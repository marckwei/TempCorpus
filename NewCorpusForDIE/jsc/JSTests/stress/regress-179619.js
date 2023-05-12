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

//@ runDefault

var createBuiltin = $vm.createBuiltin;
var loadGetterFromGetterSetter = $vm.loadGetterFromGetterSetter;

var exception;
var getter;

try {
    getter = loadGetterFromGetterSetter();
} catch (e) {
    exception = e;
}
if (exception != "TypeError: Invalid use of loadGetterFromGetterSetter test function: argument is not a GetterSetter")
    throw "FAILED";
if (getter)
    throw "FAILED: unexpected result";
exception = undefined;

try {
    getter = loadGetterFromGetterSetter(undefined);
} catch (e) {
    exception = e;
}
if (exception != "TypeError: Invalid use of loadGetterFromGetterSetter test function: argument is not a GetterSetter")
    throw "FAILED";
if (getter)
    throw "FAILED: unexpected result";
exception = undefined;

function tryGetByIdText(propertyName) { return `(function (base) { return @tryGetById(base, '${propertyName}'); })`; }
let getSetterGetter = createBuiltin(tryGetByIdText("bar"));

try {
    noGetterSetter = { };
    getter = loadGetterFromGetterSetter(getSetterGetter(noGetterSetter, "bar"));
} catch (e) {
    exception = e;
}
if (exception != "TypeError: Invalid use of loadGetterFromGetterSetter test function: argument is not a GetterSetter")
    throw "FAILED";
if (getter)
    throw "FAILED: unexpected result";
exception = undefined;

try {
    hasGetter = { get bar() { return 22; } };
    getter = loadGetterFromGetterSetter(getSetterGetter(hasGetter, "bar"));
} catch (e) {
    exception = e;
}
if (exception)
    throw "FAILED: unexpected exception: " + exception;
if (!getter)
    throw "FAILED: unable to get getter";

try {
    // When a getter is not specified, a default getter should be assigned as long as there's also a setter.
    hasSetter = { set bar(x) { return 22; } };
    getter = loadGetterFromGetterSetter(getSetterGetter(hasSetter, "bar"));
} catch (e) {
    exception = e;
}
if (exception)
    throw "FAILED: unexpected exception: " + exception;
if (!getter)
    throw "FAILED: unexpected result";
