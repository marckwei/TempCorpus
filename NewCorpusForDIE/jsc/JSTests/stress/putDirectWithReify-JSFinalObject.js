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

"use strict";

const runs = 1e5;

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error(`Bad value: ${actual}!`);
}

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    try {
        func();
    } catch (error) {
        errorThrown = true;
        if (String(error) !== errorMessage)
            throw new Error(`Bad error: ${error}!`);
    }
    if (!errorThrown)
        throw new Error(`Didn't throw!`);
}

(function testFinalObject() {
    class TestFinalObjectDontDeleteBase {
        constructor() {
            Object.defineProperty(this, "foo", { value: 1, writable: true, enumerable: true, configurable: false });
        }
    }

    class TestFinalObjectDontDelete extends TestFinalObjectDontDeleteBase {
        foo = 1;
    }

    for (var i = 0; i < runs; i++) {
        shouldThrow(() => { new TestFinalObjectDontDelete(); }, "TypeError: Attempting to change configurable attribute of unconfigurable property.");
    }

    ///

    class TestFinalObjectReadOnlyBase {
        constructor() {
            Object.defineProperty(this, "foo", { value: 1, writable: false, enumerable: false, configurable: true });
        }
    }

    class TestFinalObjectReadOnly extends TestFinalObjectReadOnlyBase {
        foo = 42;
    }

    for (var i = 0; i < runs; i++) {
        var object = new TestFinalObjectReadOnly();
        shouldBe(object.foo, 42);

        var fooDesc = Object.getOwnPropertyDescriptor(object, "foo");
        shouldBe(fooDesc.value, 42);
        shouldBe(fooDesc.writable, true);
        shouldBe(fooDesc.enumerable, true);
        shouldBe(fooDesc.configurable, true);
    }

    ///

    class TestFinalObjectNonExtendableBase {
        constructor() {
            Object.preventExtensions(this);
        }
    }

    class TestFinalObjectNonExtendable extends TestFinalObjectNonExtendableBase {
        foo = 42;
    }

    for (var i = 0; i < runs; i++) {
        shouldThrow(() => { new TestFinalObjectNonExtendable(); }, "TypeError: Attempting to define property on object that is not extensible.");
    }
})();

(function testNonReifiedStatic() {
    class TestNonReifiedStaticBase {
        constructor() {
            return $vm.createStaticDontDeleteDontEnum();
        }
    }

    class TestNonReifiedStaticDontEnum extends TestNonReifiedStaticBase {
        dontEnum = 42;
    }

    for (var i = 0; i < runs; i++) {
        var object = new TestNonReifiedStaticDontEnum();
        shouldBe(object.dontEnum, 42);

        var dontEnumDesc = Object.getOwnPropertyDescriptor(object, "dontEnum");
        shouldBe(dontEnumDesc.value, 42);
        shouldBe(dontEnumDesc.writable, true);
        shouldBe(dontEnumDesc.enumerable, true);
        shouldBe(dontEnumDesc.configurable, true);
    }

    class TestNonReifiedStaticDontDelete extends TestNonReifiedStaticBase {
        dontDelete = "foo";
    }

    for (var i = 0; i < runs; i++) {
        shouldThrow(() => { new TestNonReifiedStaticDontDelete(); }, "TypeError: Attempting to change configurable attribute of unconfigurable property.");
    }
})();
