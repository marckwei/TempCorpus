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

function shouldBeArray(actual, expected) {
    shouldBe(actual.length, expected.length);
    for (var i = 0; i < expected.length; ++i) {
        try {
            if (Array.isArray(expected[i])) {
                shouldBe(Array.isArray(actual[i]), true);
                shouldBeArray(actual[i], expected[i]);
            } else
                shouldBe(actual[i], expected[i]);
        } catch(e) {
            print(JSON.stringify(actual));
            throw e;
        }
    }
}

function shouldThrow(func, errorMessage) {
    var errorThrown = false;
    var error = null;
    try {
        func();
    } catch (e) {
        errorThrown = true;
        error = e;
    }
    if (!errorThrown)
        throw new Error('not thrown');
    if (String(error) !== errorMessage)
        throw new Error(`bad error: ${String(error)}`);
}

shouldBe([].flat.length, 0);
shouldBe([].flat.name, `flat`);

shouldBeArray([].flat(), []);
shouldBeArray([0, 1, 2, 3, , 4].flat(), [0, 1, 2, 3, 4]);
shouldBeArray([,,,,,].flat(), []);

shouldBeArray([].flat(0), []);
shouldBeArray([0, 1, 2, 3, , 4].flat(0), [0, 1, 2, 3, 4]);
shouldBeArray([,,,,,].flat(0), []);

shouldBeArray([].flat(-1), []);
shouldBeArray([0, 1, 2, 3, , 4].flat(-1), [0, 1, 2, 3, 4]);
shouldBeArray([,,,,,].flat(-1), []);

shouldBeArray([[],[]].flat(), []);
shouldBeArray([[0],[1]].flat(), [0,1]);
shouldBeArray([[0],[],1].flat(), [0,1]);
shouldBeArray([[0],[[]],1].flat(), [0,[],1]);
shouldBeArray([[0],[[]],1].flat(1), [0,[],1]);
shouldBeArray([[0],[[]],1].flat(2), [0,1]);

shouldBeArray([[],[]].flat(0), [[],[]]);
shouldBeArray([[0],[1]].flat(0), [[0],[1]]);
shouldBeArray([[0],[],1].flat(0), [[0],[],1]);
shouldBeArray([[0],[[]],1].flat(0), [[0],[[]],1]);

shouldBeArray([[[[[[[[[[[[[[[[[[[[[42]]]]]]]]]]]]]]]]]]]]].flat(Infinity), [42]);

var array = [];
shouldBe(array.flat() !== array, true);

class DerivedArray extends Array { }
shouldBe((new DerivedArray).flat() instanceof DerivedArray, true);
var flat = [].flat;
var realm = createGlobalObject();
shouldBe(flat.call({}) instanceof Array, true);
shouldBe(flat.call(new realm.Array) instanceof Array, true);
var array2 = new realm.Array;
array2.constructor = 0;

shouldThrow(() => {
    flat.call(array2);
}, `TypeError: Species construction did not get a valid constructor`);

var array2 = new realm.Array;
array2.constructor = undefined;
shouldBe(flat.call(array2) instanceof Array, true);

var array2 = new realm.Array;
array2.constructor = {
    get [Symbol.species]() {
        return null;
    }
};
shouldBe(flat.call(array2) instanceof Array, true);

var array2 = new realm.Array;
array2.constructor = {
    get [Symbol.species]() {
        return undefined;
    }
};
shouldBe(flat.call(array2) instanceof Array, true);

var array2 = new realm.Array;
array2.constructor = {
    get [Symbol.species]() {
        return DerivedArray;
    }
};
shouldBe(flat.call(array2) instanceof DerivedArray, true);
