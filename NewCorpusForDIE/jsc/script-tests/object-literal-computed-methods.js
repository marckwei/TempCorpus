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

description("basic tests for object literal computed methods");

shouldNotThrow("o = { ['f'+'oo']() { return 10; } };");
shouldBe("o.foo()", "10");
shouldBe("typeof o.foo", "'function'");
shouldBe("o.foo.length", "0");
shouldBe("o.foo.name", "'foo'");
shouldBe("o.foo.toString()", "'function () { return 10; }'");
shouldBe("Object.getOwnPropertyDescriptor(o, 'foo').value", "o.foo");
shouldBeTrue("Object.getOwnPropertyDescriptor(o, 'foo').enumerable");
shouldBeTrue("Object.getOwnPropertyDescriptor(o, 'foo').configurable");
shouldBeTrue("Object.getOwnPropertyDescriptor(o, 'foo').writable");

shouldNotThrow("methodName = 'add'; o = { [methodName](x, y) { return x + y; } };");
shouldBe("o.add(42, -10)", "32");
shouldBe("typeof o.add", "'function'");
shouldBe("o.add.length", "2");
shouldBe("o.add.name", "'add'");
shouldBe("o.add.toString()", "'function (x, y) { return x + y; }'");

shouldNotThrow("o = { [ (function() { return 'method'; })() ](x, y) { return x + y; } };");
shouldBe("o.method(142, -10)", "132");

shouldNotThrow("o = { [10*10]() { return 100; } };");
shouldBe("o[100]()", "100");
shouldBe("o['100']()", "100");
shouldNotThrow("o = { [100 + 0.100]() { return 100.100; } };");
shouldBe("o[100.1]()", "100.1");
shouldBe("o['100.1']()", "100.1");

shouldNotThrow("o = { ['a' + 'dd']([x, y]) { return x + y; } };");
shouldBe("o.add([142, -100])", "42");

shouldNotThrow("o = { [Array]([x, y]) { return x + y; } };");
shouldBe("o[Array.toString()]([142, -100])", "42");

a = 1; b = 2; c = 3; foo = "foo"; bar = "bar";
shouldNotThrow("o = { foo() { return 10; }, };");
shouldNotThrow("o = { foo (  ) { return 10; } };");
shouldNotThrow("o = {[true](){return true;}};");
shouldNotThrow("o = {[NaN](){return NaN;}};");
shouldNotThrow("o = {[eval](){return eval;}};");
shouldNotThrow("o = { a:1, [foo]() { return 10; }, [bar]() { return 20; }, b: 2 };");
shouldNotThrow("o = { a:1, [foo]() { return 10; }, [bar]() { return 20; }, b };");
shouldNotThrow("o = { a:1, [foo]() { return 10; }, b: b, [bar]() { return 20; }, c: 2 };");
shouldNotThrow("o = { a:1, [foo]() { return 10; }, b, [bar]() { return 20; }, c };");

shouldNotThrow("o = {[foo]:{[bar](){ return 100; }}};");
shouldBe("o.foo.bar()", "100");

// Duplicate methods are okay.
shouldNotThrow("o = { [foo]() { return 10; }, [foo]() { return 20; } };");
shouldBe("o.foo()", "20");

// Method named "get" or "set".
shouldNotThrow("o = { ['get'](x, y) { return x + y; } };");
shouldBe("o.get('hello', 'world')", "'helloworld'");
shouldNotThrow("o = { ['set'](x, y) { return x + y; } };");
shouldBe("o.set('hello', 'world')", "'helloworld'");

// Function parse errors.
shouldThrow("({ [](,,,){} })");
shouldThrow("({ [1+](){} })");
shouldThrow("({ [1,](){} })");
shouldThrow("({ [1,'name'](){} })");
shouldThrow("({ [[1](){} })");
shouldThrow("({ [foo](,,,){} })");
shouldThrow("({ [foo](a{}, bar(){} })");
shouldThrow("({ [foo](a, b), bar(){} })");
shouldThrow("({ [foo](a, b) { if }, bar(){} })");

// __proto__ method should be not modify the prototype.
shouldBeTrue("({__proto__: function(){}}) instanceof Function");
shouldBeFalse("({['__proto__'](){}}) instanceof Function");
shouldBeTrue("({['__proto__'](){}}).__proto__ instanceof Function");
