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

var createBuiltin = $vm.createBuiltin;
var loadGetterFromGetterSetter = $vm.loadGetterFromGetterSetter;

function assert(b, m) {
    if (!b)
        throw new Error("Bad:" + m);
}

function makePolyProtoObject() {
    function foo() {
        class C {
            constructor() { this._field = 42; }
        };
        return new C;
    }
    for (let i = 0; i < 15; ++i)
        foo();
    return foo();
}

function tryGetByIdText(propertyName) { return `(function (base) { return @tryGetById(base, '${propertyName}'); })`; }
let getFoo = createBuiltin(tryGetByIdText("foo"));
let getBar = createBuiltin(tryGetByIdText("bar"));
let getNonExistentField = createBuiltin(tryGetByIdText("nonExistentField"));

let x = makePolyProtoObject();
x.__proto__ = { foo: 42, get bar() { return 22; } };
let barGetter = Object.getOwnPropertyDescriptor(x.__proto__, "bar").get;
assert(typeof barGetter === "function");
assert(barGetter() === 22);

function validate(x) {
    assert(getFoo(x) === 42);
    assert(loadGetterFromGetterSetter(getBar(x)) === barGetter);
    assert(getNonExistentField(x) === undefined);
}
noInline(validate);

for (let i = 0; i < 1000; ++i) {
    validate(x);
}
