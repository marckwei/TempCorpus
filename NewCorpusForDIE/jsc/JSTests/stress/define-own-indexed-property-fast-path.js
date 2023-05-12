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

function assertSameDescriptor(a, b) {
  const aString = JSON.stringify(a, null, 2);
  const bString = JSON.stringify(b, null, 2);

  if (aString !== bString)
    throw new Error(`Bad descriptor!\nActual: ${aString}\nExpected: ${bString}`);
}

function getCombinations(options) {
  const optionKeys = Object.keys(options);
  const results = [];

  function getNextCombination(optionIndex, current) {
    const optionKey = optionKeys[optionIndex];

    for (const value of options[optionKey]) {
      current[optionKey] = value;

      const nextIndex = optionIndex + 1;
      if (nextIndex < optionKeys.length) {
        getNextCombination(nextIndex, current);
        break;
      }

      // deep clone `current` and remove `undefined` values
      const result = JSON.parse(JSON.stringify(current));
      results.push(result);
    }
  }

  getNextCombination(0, {});
  return results;
}

function testCreateProperty(object, key, descriptor) {
  if (object.hasOwnProperty(key))
    throw new Error(`Property ${key} should not exist.`);

  Object.defineProperty(object, key, descriptor);

  assertSameDescriptor(
    Object.getOwnPropertyDescriptor(object, key),
    {value: undefined, writable: false, enumerable: false, configurable: false, ...descriptor},
  );
}

function testRedefineProperty(object, key, descriptor) {
  if (!object.hasOwnProperty(key))
    throw new Error(`Property ${key} should exist.`);

  const value = object[key];
  Object.defineProperty(object, key, descriptor);

  assertSameDescriptor(
    Object.getOwnPropertyDescriptor(object, key),
    {value, writable: true, enumerable: true, configurable: true, ...descriptor},
  );
}

const dataDescriptor = {
  value: [1, 2, undefined],
  writable: [true, false, undefined],
  enumerable: [true, false, undefined],
  configurable: [true, false, undefined],
};

const accessorDescriptor = {
  get: [function() {}, undefined],
  set: [function(value) {}, undefined],
  enumerable: [true, false, undefined],
  configurable: [true, false, undefined],
};

for (const descriptor of getCombinations(dataDescriptor)) {
  testCreateProperty([], "0", descriptor);
  testRedefineProperty([1], "0", descriptor);
}

for (const descriptor of getCombinations(accessorDescriptor)) {
  testCreateProperty([1, 2], "2", descriptor);
  testRedefineProperty([1, 2, 3], "2", descriptor);
}
