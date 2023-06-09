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
'This tests for caller property in functions. Only functions that are called from inside of other functions and have a parent should have this property set. Tests return true when caller is found and false when the caller is null.'
)       
function child()
{
    return (child.caller !== null);
}

function parent()
{
    return child();
}

var childHasCallerWhenExecutingGlobalCode = (child.caller !== null);
var childHasCallerWhenCalledWithoutParent = child();
var childHasCallerWhenCalledFromWithinParent = parent();

shouldBe('childHasCallerWhenExecutingGlobalCode', 'false');
shouldBe('childHasCallerWhenCalledWithoutParent', 'false');
shouldBe('childHasCallerWhenCalledFromWithinParent', 'true')

// The caller property should throw in strict mode, and a non-strict function cannot use caller to reach a strict caller (see ES5.1 15.3.5.4).
function nonStrictCallee() { return nonStrictCallee.caller; }
function strictCallee() { "use strict"; return strictCallee.caller; }
function nonStrictCaller(x) { return x(); }
// Tail calls leak and show our caller's caller, which is null here
function strictCaller(x) { "use strict"; var result = x(); return result; }
function strictTailCaller(x) { "use strict"; return x(); }
shouldBe("nonStrictCaller(nonStrictCallee)", "nonStrictCaller");
shouldThrow("nonStrictCaller(strictCallee)", '"TypeError: \'arguments\', \'callee\', and \'caller\' cannot be accessed in this context."');
shouldBe("strictCaller(nonStrictCallee)", "null");
shouldThrow("strictCaller(strictCallee)", '"TypeError: \'arguments\', \'callee\', and \'caller\' cannot be accessed in this context."');
shouldBe("strictTailCaller(nonStrictCallee)", "null");
shouldThrow("strictTailCaller(strictCallee)");

// .caller within a bound function reaches the caller, ignoring the binding.
var boundNonStrictCallee = nonStrictCallee.bind();
var boundStrictCallee = strictCallee.bind();
shouldBe("nonStrictCaller(boundNonStrictCallee)", "nonStrictCaller");
shouldThrow("nonStrictCaller(boundStrictCallee)");
shouldBe("strictCaller(boundNonStrictCallee)", "null");
shouldThrow("strictCaller(boundStrictCallee)");
shouldBe("strictTailCaller(boundNonStrictCallee)", "null");
shouldThrow("strictTailCaller(boundStrictCallee)");

shouldBe("nonStrictCaller(new Proxy(nonStrictCallee, {}))", "nonStrictCaller");
shouldBe("nonStrictCaller(new Proxy(nonStrictCallee, {}).bind())", "nonStrictCaller");
shouldBe("nonStrictCaller(new Proxy(new Proxy(nonStrictCallee, {}), {}))", "nonStrictCaller");
shouldBe("nonStrictCaller(new Proxy(boundNonStrictCallee, {}))", "nonStrictCaller");

shouldBe("nonStrictCaller(new Proxy(nonStrictCallee, Reflect))", "nonStrictCaller"); // tail call
shouldBe("nonStrictCaller(new Proxy(new Proxy(nonStrictCallee, Reflect), {}))", "nonStrictCaller"); // tail call
shouldBe("nonStrictCaller(new Proxy(new Proxy(nonStrictCallee, {}), Reflect))", "null"); // no tail call in Proxy's [[Call]]

// Check that .caller throws as expected, over an accessor call. (per https://tc39.github.io/ecma262/#sec-forbidden-extensions)
function getFooGetter(x) { return Object.getOwnPropertyDescriptor(x, 'foo').get; }
function getFooSetter(x) { return Object.getOwnPropertyDescriptor(x, 'foo').set; }
var nonStrictAccessor = {
    get foo() { return getFooGetter(nonStrictAccessor).caller; },
    set foo(x) { if (getFooSetter(nonStrictAccessor).caller !==x) throw false; }
};
var strictAccessor = {
    get foo() { "use strict"; return getFooGetter(strictAccessor).caller; },
    set foo(x) { "use strict"; if (getFooSetter(strictAccessor).caller !==x) throw false; }
};
function nonStrictGetter(x) { return x.foo; }
function nonStrictSetter(x) { x.foo = nonStrictSetter; return true; }
function strictGetter(x) { "use strict"; return x.foo; }
function strictSetter(x) { "use strict"; x.foo = nonStrictSetter; return true; }
shouldThrow("nonStrictGetter(nonStrictAccessor)", '"TypeError: \'arguments\', \'callee\', and \'caller\' cannot be accessed in this context."');
shouldThrow("nonStrictGetter(strictAccessor)", '"TypeError: \'arguments\', \'callee\', and \'caller\' cannot be accessed in this context."');
shouldThrow("strictGetter(nonStrictAccessor)", '"TypeError: \'arguments\', \'callee\', and \'caller\' cannot be accessed in this context."');
shouldThrow("strictSetter(nonStrictAccessor)", '"TypeError: \'arguments\', \'callee\', and \'caller\' cannot be accessed in this context."');
shouldThrow("strictGetter(strictAccessor)");
shouldThrow("strictSetter(strictAccessor)");
