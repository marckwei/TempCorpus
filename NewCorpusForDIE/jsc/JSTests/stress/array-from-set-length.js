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

for (var i = 0; i < 10; ++i) {
    Object.defineProperty(Array.prototype, i, {
        get() {
            throw new Error('get is called.');
        },
        set(value) {
            throw new Error('set is called.');
        }
    });
}

class ArrayLike {
    constructor(length) {
        this.lengthCalled = false;
        this._length = length;
    }
    set length(value) {
        this.lengthCalled = true;
        this._length = value;
    }
    get length() {
        return this._length;
    }
}

var arrayLike = new ArrayLike(10);
for (var i = 0; i < 10; ++i) {
    arrayLike[i] = i;
}
shouldBe(arrayLike.lengthCalled, false);

var generated = Array.from.call(ArrayLike, arrayLike);

shouldBe(generated.length, 10);
shouldBe(generated instanceof ArrayLike, true);
for (var i = 0; i < 10; ++i) {
    shouldBe(generated[i], i);
}
shouldBe(arrayLike.lengthCalled, false);
shouldBe(generated.lengthCalled, true);
