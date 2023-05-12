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

function getMappedArguments(a, b) { return arguments; }
function getUnmappedArguments(a, b) { "use strict"; return arguments; }

function shouldBeArray(actual, expected) {
    var isEqual =
        actual.length === expected.length &&
        actual.every((item, index) => item === expected[index]);
    if (!isEqual)
        throw new Error(`Expected [${actual.map(String)}] to equal [${expected.map(String)}]`);
}

function forIn(object) {
    var keys = [];
    for (var key in object)
        keys.push(key);
    return keys;
}

noInline(getMappedArguments);
noInline(getUnmappedArguments);
noInline(forIn);

(function() {
    for (var i = 0; i < 1e4; ++i) {
        var mappedArguments = getMappedArguments(0, 1, 2);
        shouldBeArray(forIn(mappedArguments), ["0", "1", "2"]);
        shouldBeArray(Object.keys(mappedArguments), ["0", "1", "2"]);
        shouldBeArray(Reflect.ownKeys(mappedArguments), ["0", "1", "2", "length", "callee", Symbol.iterator]);

        var unmappedArguments = getUnmappedArguments(0);
        shouldBeArray(forIn(unmappedArguments), ["0"]);
        shouldBeArray(Object.keys(unmappedArguments), ["0"]);
        shouldBeArray(Reflect.ownKeys(unmappedArguments), ["0", "length", "callee", Symbol.iterator]);
    }
})();

(function() {
    for (var i = 0; i < 1e4; ++i) {
        var mappedArguments = getMappedArguments(0, 1);
        mappedArguments[8] = 8;
        mappedArguments[2] = 2;
        shouldBeArray(forIn(mappedArguments), ["0", "1", "2", "8"]);
        shouldBeArray(Object.keys(mappedArguments), ["0", "1", "2", "8"]);
        shouldBeArray(Reflect.ownKeys(mappedArguments), ["0", "1", "2", "8", "length", "callee", Symbol.iterator]);

        var unmappedArguments = getUnmappedArguments();
        unmappedArguments[12] = 12;
        unmappedArguments[3] = 3;
        shouldBeArray(forIn(unmappedArguments), ["3", "12"]);
        shouldBeArray(Object.keys(unmappedArguments), ["3", "12"]);
        shouldBeArray(Reflect.ownKeys(unmappedArguments), ["3", "12", "length", "callee", Symbol.iterator]);
    }
})();

(function() {
    for (var i = 0; i < 1e4; ++i) {
        var mappedArguments = getMappedArguments(0);
        mappedArguments.foo = 1;
        mappedArguments.bar = 2;
        shouldBeArray(forIn(mappedArguments), ["0", "foo", "bar"]);
        shouldBeArray(Object.keys(mappedArguments), ["0", "foo", "bar"]);
        // FIXME: Symbol.iterator should come after "foo" and "bar" 
        // shouldBeArray(Reflect.ownKeys(mappedArguments), ["0", "length", "callee", "foo", "bar", Symbol.iterator]);

        var unmappedArguments = getUnmappedArguments(0, 1, 2);
        unmappedArguments.foo = 1;
        unmappedArguments.bar = 2;
        shouldBeArray(forIn(unmappedArguments), ["0", "1", "2", "foo", "bar"]);
        shouldBeArray(Object.keys(unmappedArguments), ["0", "1", "2", "foo", "bar"]);
        // FIXME: "callee" should come before "foo" and "bar"
        // shouldBeArray(Reflect.ownKeys(unmappedArguments), ["0", "1", "2", "length", "callee", "foo", "bar", Symbol.iterator]);
    }
})();

// FIXME: Add more tests, covering:
// * added symbol properties;
// * added together index, non-index, and symbol properties;
// * deleted, re-added, and redefined as DontEnum index properties, both within and beyond "length";
// * deleted, re-added, and redefined as DontEnum "length", "callee", and Symbol.iterator properties.
