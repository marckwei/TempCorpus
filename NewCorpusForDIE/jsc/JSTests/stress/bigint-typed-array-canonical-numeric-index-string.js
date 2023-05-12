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

//@ requireOptions("--forceEagerCompilation=true", "--osrExitCountForReoptimization=10", "--useConcurrentJIT=0")

const typedArrays = [
    BigInt64Array,
    BigUint64Array,
];

const failures = new Set();

let value = 0;
function makeTest(test) {
    noInline(test);

    function assert(typedArray, condition, message) {
        if (!condition)
            failures.add(`${typedArray.name}: ${message}`);
    }

    function testFor(typedArray, key) {
        return new Function('key', 'typedArray', 'test', 'assert', `
            const value = BigInt(${value++} % 128);
            const u8 = new typedArray(1);
            u8[key] = value;
            test(u8, key, value, assert);
        `).bind(undefined, key, typedArray, test, assert.bind(undefined, typedArray));
    };

    return function(keys) {
        for (let typedArray of typedArrays) {
            for (let key of keys) {
                const runTest = testFor(typedArray, key);
                noInline(runTest);
                for (let i = 0; i < 10; i++) {
                    runTest();
                }
            }
        }
    }
}

const testInvalidIndices = makeTest((array, key, value, assert) => {
    assert(array[key] === undefined, `${key.toString()} should not be set`);
    assert(!(key in array), `${key.toString()} should not be in array`);

    const keys = Object.keys(array);
    assert(keys.length === 1, `no new keys should be added`);
    assert(keys[0] === '0', `'0' should be the only key`);
    assert(array[0] === 0n, `offset 0 should not have been modified`);

    assert(array.hasOwnProperty(key) === false, `hasOwnProperty(${key.toString()}) should be false`);
    assert(Object.getOwnPropertyDescriptor(array, key) === undefined, `Object.getOwnPropertyDescriptor(${key.toString()}) should be undefined`);
});

testInvalidIndices([
    '-0',
    '-1',
    -1,
    1,
    'Infinity',
    '-Infinity',
    'NaN',
    '0.1',
    '4294967294',
    '4294967295',
    '4294967296',
]);

const testValidIndices = makeTest((array, key, value, assert) => {
    assert(array[key] === value, `${key.toString()} should be set to ${value}`);
    assert(key in array, `should contain key ${key.toString()}`);

    assert(array.hasOwnProperty(key) === true, `hasOwnProperty(${key.toString()}) should be true`);
    const descriptor = Object.getOwnPropertyDescriptor(array, key);
    assert(typeof descriptor === 'object', `Object.getOwnPropertyDescriptor(${key.toString()}) return an object`);
    assert(descriptor.value === value, `descriptor.value should be ${value}`);
    assert(descriptor.writable === true, `descriptor.writable should be true`);
    assert(descriptor.enumerable === true, `descriptor.enumerable should be true`);
    assert(descriptor.configurable === true, `descriptor.configurable should be true`);
});

testValidIndices([
    '01',
    '0.10',
    '+Infinity',
    '-NaN',
    '-0.0',
    Symbol('1'),
    '0',
    0,
]);

if (failures.size)
    throw new Error(`Subtests failed:\n${Array.from(failures).join('\n')}`);
