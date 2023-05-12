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

function assert(x) {
    if (!x)
        throw Error("Bad");
}

const isConstructor = $vm.createBuiltin("(function (c) { return @isConstructor(c); })");
noInline(isConstructor);

for (let i = 0; i < 1e4; ++i) {

// Functions.
assert(isConstructor(assert));
assert(isConstructor(class{}));
assert(isConstructor(function(){}));

// Proxy functions.
assert(isConstructor(new Proxy(assert, {})));
assert(isConstructor(new Proxy(class{}, {})));
assert(isConstructor(new Proxy(function(){}, {})));

// Bound functions.
assert(isConstructor(assert.bind(null), {}));
assert(isConstructor((class{}).bind(null), {}));
assert(isConstructor(function(){}.bind(null), {}));

// Builtin constructors.
assert(isConstructor(Array));
assert(isConstructor(ArrayBuffer));
assert(isConstructor(BigInt));
assert(isConstructor(Boolean));
assert(isConstructor(Date));
assert(isConstructor(Error));
assert(isConstructor(Function));
assert(isConstructor(Map));
assert(isConstructor(Number));
assert(isConstructor(Object));
assert(isConstructor(Promise));
assert(isConstructor(Proxy));
assert(isConstructor(RegExp));
assert(isConstructor(Set));
assert(isConstructor(String));
assert(isConstructor(Symbol));
assert(isConstructor(WeakMap));
assert(isConstructor(WeakSet));

// Non-function values.
assert(!isConstructor(undefined));
assert(!isConstructor(null));
assert(!isConstructor(true));
assert(!isConstructor(false));
assert(!isConstructor(0));
assert(!isConstructor(1));
assert(!isConstructor(1.1));
assert(!isConstructor(-1));
assert(!isConstructor(Date.now()));
assert(!isConstructor(new Date));
assert(!isConstructor(Infinity));
assert(!isConstructor(NaN));
assert(!isConstructor(""));
assert(!isConstructor("test"));
assert(!isConstructor([]));
assert(!isConstructor({}));
assert(!isConstructor(/regex/));
assert(!isConstructor(Math));
assert(!isConstructor(JSON));
assert(!isConstructor(Symbol()));
assert(!isConstructor(new Error));
assert(!isConstructor(new Proxy({}, {})));
assert(!isConstructor(Array.prototype));

// Getters / setters are not constructors.
assert(!isConstructor(Object.getOwnPropertyDescriptor({get f(){}}, "f").get));
assert(!isConstructor(Object.getOwnPropertyDescriptor({set f(x){}}, "f").set));

// Arrow functions are not constructors.
assert(!isConstructor(()=>{}));

// Generators are not constructors.
assert(!isConstructor(function*(){}));

// Native builtins are not constructors.
assert(!isConstructor(isConstructor));

// https://tc39.github.io/ecma262/#sec-built-in-function-objects
// Built-in function objects that are not identified as constructors do not
// implement the [[Construct]] internal method unless otherwise specified in
// the description of a particular function.
assert(!isConstructor(Array.of));
assert(!isConstructor(Object.getOwnPropertyDescriptor));
assert(!isConstructor(Date.now));
assert(!isConstructor(Math.cos));
assert(!isConstructor(JSON.stringify));
assert(!isConstructor(Promise.all));
assert(!isConstructor(Proxy.revocable));
assert(!isConstructor(Symbol.for));
assert(!isConstructor(Array.prototype.push));

// Proxy and bound functions carry forward non-constructor-ness.
assert(isConstructor(new Proxy(Symbol, {})));
assert(isConstructor(Symbol.bind(null)));
assert(!isConstructor(new Proxy(Math.cos, {})));
assert(!isConstructor(Math.cos.bind(null)));

}
