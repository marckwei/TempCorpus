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

function shouldBe(actual, expected) {
    if (actual !== expected)
        throw new Error('bad value: ' + actual);
}

{
    let object = {
        n()
        {
            return 42;
        }
    };

    let derived = {
        m()
        {
            return eval("super.n()");
        }
    };
    Object.setPrototypeOf(derived, object);
    shouldBe(derived.m(), 42);
    // Cached.
    shouldBe(derived.m(), 42);
}

{
    let object = {
        l()
        {
            return 42;
        }
    };

    let derived = {
        m()
        {
            return eval("super.l()");
        }
    };
    Object.setPrototypeOf(derived, object);
    shouldBe(derived.m(), 42);
    // Cached.
    shouldBe(derived.m(), 42);

    class Parent {
        l()
        {
            return 55;
        }
    }

    class Derived extends Parent {
        m()
        {
            return eval("super.l()");
        }
    }
    let instance = new Derived();
    // Under the strict code, not cached.
    shouldBe(instance.l(), 55);
    shouldBe(instance.l(), 55);
}
