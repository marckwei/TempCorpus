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
        throw new Error(`Bad value: ${actual}!`);
}

function shouldThrow(func, expectedError) {
    let errorThrown = false;
    try {
        func();
    } catch (error) {
        errorThrown = true;
        if (error.toString() !== expectedError)
            throw new Error(`Bad error: ${error}!`);
    }
    if (!errorThrown)
        throw new Error(`Didn't throw!`);
};

let objFooSetterCalls = 0;
let obj;

const foo = "fooValue";

obj = {
    get foo() { return "fooGetter"; },
    foo: "fooValue",
    set foo(_val) { objFooSetterCalls++; },
};

shouldBe(obj.foo, undefined);
obj.foo = 1;
shouldBe(obj.foo, undefined);
shouldBe(objFooSetterCalls, 1);


obj = {
    set foo(_val) { objFooSetterCalls++; },
    foo,
    get foo() { return "fooGetter"; },
};

shouldBe(obj.foo, "fooGetter");
obj.foo = 1;
shouldThrow(() => { "use strict"; obj.foo = 2; }, "TypeError: Attempted to assign to readonly property.");
shouldBe(obj.foo, "fooGetter");
shouldBe(objFooSetterCalls, 1);


obj = {
    foo: "fooValue",
    get foo() { return "fooGetter"; },
};

shouldBe(obj.foo, "fooGetter");
obj.foo = 1;
shouldThrow(() => { "use strict"; obj.foo = 2; }, "TypeError: Attempted to assign to readonly property.");
shouldBe(obj.foo, "fooGetter");
shouldBe(objFooSetterCalls, 1);


obj = {
    foo,
    set foo(_val) { objFooSetterCalls++; },
};

shouldBe(obj.foo, undefined);
obj.foo = 1;
shouldBe(obj.foo, undefined);
shouldBe(objFooSetterCalls, 2);


obj = {
    foo: "fooValue",
    get foo() { return "fooGetter"; },
    set foo(_val) { objFooSetterCalls++; },
};

shouldBe(obj.foo, "fooGetter");
obj.foo = 1;
shouldBe(obj.foo, "fooGetter");
shouldBe(objFooSetterCalls, 3);


obj = {
    get foo() { return "fooGetter"; },
    set foo(_val) { objFooSetterCalls++; },
    foo,
};

shouldBe(obj.foo, "fooValue");
obj.foo = 1;
shouldBe(obj.foo, 1);
shouldBe(objFooSetterCalls, 3);
