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

Object.defineProperty(Array.prototype, '0', {
    get() {
        throw new Error('out');
    },
    set(value) {
        throw new Error('out');
    }
});

{
    let object = {
        a: 42,
        b: 42,
        c: 42
    };
    {
        let result = Object.keys(object);
        shouldBe(JSON.stringify(result), `["a","b","c"]`);
    }
    {
        let result = Object.values(object);
        shouldBe(JSON.stringify(result), `[42,42,42]`);
    }
}
{
    let object = {
        [Symbol.iterator]: 42,
        b: 42,
        c: 42
    };
    {
        let result = Object.getOwnPropertyNames(object);
        shouldBe(JSON.stringify(result), `["b","c"]`);
    }
    {
        let result = Object.getOwnPropertySymbols(object);
        shouldBe(result.length, 1);
        shouldBe(result[0], Symbol.iterator);
    }
}
