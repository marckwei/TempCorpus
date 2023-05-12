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

function shouldBe(actual, expected, testInfo) {
    if (actual !== expected)
        throw new Error(`Bad value: ${actual} (${testInfo})`);
}

function shouldThrow(fn, expectedError, testInfo) {
    let errorThrown = false;
    try {
        fn();
    } catch (error) {
        errorThrown = true;
        if (error.toString() !== expectedError)
            throw new Error(`Bad error: ${error} (${testInfo})`);
    }
    if (!errorThrown)
        throw new Error(`Not thrown (${testInfo})`);
}

function getFunctionsWithoutPrototype() {
    const { get, set } = Object.getOwnPropertyDescriptor({ get accessor() {}, set accessor(_v) {} }, "accessor");
    const arrowFunction = () => {};
    const asyncArrowFunction = async () => {};

    return [
        get,
        set,
        arrowFunction,
        asyncArrowFunction,
        { method() {} }.method,
        async function asyncFunction() {},
        { async asyncMethod() {} }.asyncMethod,
    ];
}

function getFunctionsWithNonConfigurablePrototype() {
    return [
        function normalNonStrictFunction() {},
        function normalStrictFunction() { "use strict"; },
        class baseConstructor {},
        class derivedConstructor extends Array {},
        function* syncGenerator() {},
        { * syncGeneratorMethod() {} }.syncGeneratorMethod,
        async function* asyncGenerator() {},
        { async * asyncGeneratorMethod() {} }.asyncGeneratorMethod,
        Array,
    ];
}

function defineNonConfigurablePrototype(fn) {
    return Object.defineProperties(fn, {
        prototype: { value: {}, configurable: false },
        name: { value: `redefined ${fn.name}` },
    });
}

const functionsWithoutPrototype = [
    ...getFunctionsWithoutPrototype(),
    ...getFunctionsWithNonConfigurablePrototype().map(fn => fn.bind()),
    parseInt,
];

const functionsWithNonConfigurablePrototype = [
    ...getFunctionsWithoutPrototype().map(defineNonConfigurablePrototype),
    ...getFunctionsWithNonConfigurablePrototype(),
];

(function nonStrictModeDelete() {
    for (const fn of functionsWithoutPrototype) {
        for (let i = 0; i < 1e4; ++i)
            shouldBe(delete fn.prototype, true, fn.name);
    }

    for (const fn of functionsWithNonConfigurablePrototype) {
        for (let i = 0; i < 1e4; ++i)
            shouldBe(delete fn.prototype, false, fn.name);
    }
})();

(function strictModeDelete() {
    "use strict";

    for (const fn of functionsWithoutPrototype) {
        for (let i = 0; i < 1e4; ++i)
            shouldBe(delete fn.prototype, true, fn.name);
    }

    for (const fn of functionsWithNonConfigurablePrototype) {
        for (let i = 0; i < 1e4; ++i)
            shouldThrow(() => { delete fn.prototype }, "TypeError: Unable to delete property.", fn.name);
    }
})();

(function reflectDeleteProperty() {
    noInline(Reflect.deleteProperty);

    for (const fn of functionsWithoutPrototype) {
        for (let i = 0; i < 1e4; ++i)
            shouldBe(Reflect.deleteProperty(fn, "prototype"), true, fn.name);
    }

    for (const fn of functionsWithNonConfigurablePrototype) {
        for (let i = 0; i < 1e4; ++i)
            shouldBe(Reflect.deleteProperty(fn, "prototype"), false, fn.name);
    }
})();
