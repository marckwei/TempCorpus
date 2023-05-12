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

function foo(o, prototype) {
    return o instanceof prototype;
}

noInline(foo);

function test(o, prototype, expected) {
    var actual = foo(o, prototype);
    if (actual != expected)
        throw new Error("bad result: " + actual);
}

function Foo() { }

function Bar() { }
Bar.prototype = new Foo();

for (var i = 0; i < 10000; ++i) {
    test({}, Object, true);
    test({}, Array, false);
    test({}, String, false);
    test({}, Foo, false);
    test({}, Bar, false);
    test([], Object, true);
    test([], Array, true);
    test([], String, false);
    test([], Foo, false);
    test([], Bar, false);
    test(new Foo(), Object, true);
    test(new Foo(), Array, false);
    test(new Foo(), String, false);
    test(new Foo(), Foo, true);
    test(new Foo(), Bar, false);
    test(new Bar(), Object, true);
    test(new Bar(), Array, false);
    test(new Bar(), String, false);
    test(new Bar(), Foo, true);
    test(new Bar(), Bar, true);
}
