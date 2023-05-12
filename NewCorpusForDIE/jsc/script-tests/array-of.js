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

description("Tests for Array.of");

shouldBe("Array.of.length", "0");
shouldBe("Array.of.name", "'of'");

shouldBe("Array.of(1)", "[1]");
shouldBe("Array.of(1, 2)", "[1, 2]");
shouldBe("Array.of(1, 2, 3)", "[1, 2, 3]");

shouldBe("Array.of()", "[]");
shouldBe("Array.of(undefined)", "[undefined]");
shouldBe("Array.of('hello')", "['hello']");

debug("Construct nested Array with Array.of(Array.of(1, 2, 3), Array.of(4, 5, 6, 7, 8)).");
var x = Array.of(Array.of(1, 2, 3), Array.of(4, 5, 6, 7, 8));
shouldBe("x.length", "2");
shouldBe("x[0].length", "3");
shouldBe("x[1].length", "5");

debug("Check that a setter isn't called.");

Array.prototype.__defineSetter__("0", function (value) {
    throw new Error("This should not be called.");
});

shouldNotThrow("Array.of(1, 2, 3)");

debug("\"this\" is a constructor");
var Foo = function FooBar(length) { this.givenLength = length; };
shouldBeTrue("Array.of.call(Foo, 'a', 'b', 'c') instanceof Foo");
shouldBe("Array.of.call(Foo, 'a', 'b', 'c').givenLength", "3");
shouldBe("var foo = Array.of.call(Foo, 'a', 'b', 'c'); [foo.length, foo[0], foo[1], foo[2]]", "[3, 'a', 'b', 'c']");

debug("\"this\" is not a constructor");
var nonConstructorWasCalled = false;
var nonConstructor = () => { nonConstructorWasCalled = true; };
shouldBe("Array.of.call(nonConstructor, Foo).constructor", "Array");
shouldBe("Object.getPrototypeOf(Array.of.call(nonConstructor, Foo))", "Array.prototype");
shouldBe("Array.of.call(nonConstructor, Foo).length", "1");
shouldBe("Array.of.call(nonConstructor, Foo)[0]", "Foo");
shouldBeFalse("nonConstructorWasCalled");
