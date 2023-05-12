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

description("Test to ensure correct behavior of Object.assign");

shouldBe("Object.assign.length", "2");
shouldBe("Object.assign.name", "'assign'");

debug("check TypeError on null/undefined");
shouldThrow("Object.assign()");
shouldThrow("Object.assign(undefined)");
shouldThrow("Object.assign(null)");

shouldBeTrue("var target = {}, ret = Object.assign(target); target === ret");

debug("multiple sources are copied");
shouldBeTrue("var target = {}, ret = Object.assign(target, {a: 1}); target === ret");
shouldBeTrue("var target = {}; Object.assign(target, {a: 1}); target.a === 1");
shouldBeTrue("var target = {}; Object.assign(target, {a: 1}, {b: 2}); target.b === 2");
shouldBeTrue("var target = {}; Object.assign(target, {a: 1}, {a: 2}); target.a === 2");

debug("only enumerable properties are copied");
shouldBeTrue("var target = {}, source = {}; Object.defineProperty(source, 'a', { value: 1, enumerable: false }); Object.assign(target, {a: 2}, source); target.a === 2");
shouldBeFalse("var target = {}, source = {}; Object.defineProperty(source, 'a', { value: 1, enumerable: false }); Object.assign(target, source); 'a' in target && target.a === 1");
shouldBeTrue("var target = {}, source = {}; Object.defineProperty(source, 'a', { value: 1, enumerable: false }); Object.assign(target, source, {a: 2}); target.a === 2");
shouldBeTrue("var target = {}, source = {}; Object.defineProperty(source, 'a', { value: 1, enumerable: true }); Object.assign(target, source, {a: 2}); target.a === 2");
shouldBeTrue("var target = {}, source = {}; Object.defineProperty(source, 'a', { value: 1, enumerable: true }); Object.assign(target, {a: 2}, source); target.a === 1");

debug("only own properties are copied");
shouldBeTrue("var target = {}, C = function C() {}; C.prototype.a = 1; Object.assign(target, {a: 2}, new C()); target.a === 2");

debug("Symbols are copied");
shouldBeTrue("var target = {}, source = {}, sym = Symbol('sym'); source[sym] = sym; Object.assign(target, source); target[sym] === sym");
shouldBeTrue("var target = {}, source1 = {}, source2 = {}, sym = Symbol('sym'); source1[sym] = 1; source2[sym] = 2; Object.assign(target, source1, source2); target[sym] === 2");

debug("non-enumerable Symbols are not copied");
shouldBeUndefined("var target = {}, source = {}, sym = Symbol('sym'); Object.defineProperty(source, sym, { value: 1, enumerable: false }); Object.assign(target, source); target[sym]");

debug("only own Symbols are copied");
shouldBeTrue("var target = {}, source1 = {}, sym = Symbol('sym'), C = function C() {}; C.prototype[sym] = 1; source1[sym] = 2; Object.assign(target, source1, new C()); target[sym] === 2");

debug("primitives as sources");
shouldBeTrue("var target = {}; Object.assign(target, true); Object.getOwnPropertyNames(target).length === 0");
shouldBeTrue("var target = {}; Object.assign(target, false); Object.getOwnPropertyNames(target).length === 0");
shouldBeTrue("var target = {}; Object.assign(target, NaN); Object.getOwnPropertyNames(target).length === 0");
shouldBeTrue("var target = {}; Object.assign(target, Infinity); Object.getOwnPropertyNames(target).length === 0");
shouldBeTrue("var target = {}; Object.assign(target, -Infinity); Object.getOwnPropertyNames(target).length === 0");
shouldBeTrue("var target = {}; Object.assign(target, 0); Object.getOwnPropertyNames(target).length === 0");
shouldBeTrue("var target = {}; Object.assign(target, -0); Object.getOwnPropertyNames(target).length === 0");
shouldBeTrue("var target = {}; Object.assign(target, Symbol('sym')); Object.getOwnPropertyNames(target).length === 0");
shouldBeTrue("var target = {}; Object.assign(target, ''); Object.getOwnPropertyNames(target).length === 0");
shouldBeTrue("var target = {}; Object.assign(target, 'abc'); Object.getOwnPropertyNames(target).length === 'abc'.length");

debug("primitives as target");
var is = function (a, b) {
  if (a !== a && b !== b) {
    return true;
  } else if (a === 0) {
    return a / 1 === b / 1;
  } else {
    return a === b;
  }
};
var isBoxedPrimitive = function isBoxedPrimitive(object, Wrapper, primitive) {
  return object instanceof Wrapper && is(Wrapper.prototype.valueOf.call(object), primitive);
};
shouldBeTrue("var target = Object.assign(true, { a: 1 }); isBoxedPrimitive(target, Boolean, true) && target.a === 1");
shouldBeTrue("var target = Object.assign(false, { a: 1 }); isBoxedPrimitive(target, Boolean, false) && target.a === 1");
shouldBeTrue("var target = Object.assign(NaN, { a: 1 }); isBoxedPrimitive(target, Number, NaN) && target.a === 1");
shouldBeTrue("var target = Object.assign(Infinity, { a: 1 }); isBoxedPrimitive(target, Number, Infinity) && target.a === 1");
shouldBeTrue("var target = Object.assign(-Infinity, { a: 1 }); isBoxedPrimitive(target, Number, -Infinity) && target.a === 1");
shouldBeTrue("var target = Object.assign(0, { a: 1 }); isBoxedPrimitive(target, Number, 0) && target.a === 1");
shouldBeTrue("var target = Object.assign(-0, { a: 1 }); isBoxedPrimitive(target, Number, -0) && target.a === 1");
shouldBeTrue("var sym = Symbol('sym'); var target = Object.assign(sym, { a: 1 }); isBoxedPrimitive(target, Symbol, sym) && target.a === 1");
shouldBeTrue("var target = Object.assign('', { a: 1 }); isBoxedPrimitive(target, String, '') && target.a === 1");
shouldBeTrue("var target = Object.assign('abc', { a: 1 }); isBoxedPrimitive(target, String, 'abc') && target.a === 1");
