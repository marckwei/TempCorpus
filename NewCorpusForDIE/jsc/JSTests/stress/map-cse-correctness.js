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

function assert(b) {
    if (!b)
        throw new Error("Bad result!");
}
noInline(assert);

function testHas(map, key, f) {
    let first = map.has(key);
    f();
    let second = map.has(key);
    return {first, second};
}
noInline(testHas);

function testGet(map, key, f) {
    let first = map.get(key);
    f();
    let second = map.get(key);
    return {first, second};
}
noInline(testGet);

function foo() {
    let map = new Map;
    for (let i = 0; i < 100000; i++) {
        let key = i;
        map.set(key, key);
        let f = () => map.delete(key);
        noInline(f);
        let {first, second} = testHas(map, key, f);
        assert(first);
        assert(!second);
    }
    for (let i = 0; i < 100000; i++) {
        let key = i;
        map.set(key, key);
        let f = () => {};
        noInline(f);
        let {first, second} = testHas(map, key, f);
        assert(first);
        assert(second);
    }


    for (let i = 0; i < 100000; i++) {
        let key = i;
        let value = {};
        map.set(key, value);
        let f = () => map.delete(key);
        noInline(f);
        let {first, second} = testGet(map, key, f);
        assert(first === value);
        assert(second === undefined);
    }
    for (let i = 0; i < 100000; i++) {
        let key = i;
        let value = {};
        map.set(key, value);
        let f = () => {};
        noInline(f);
        let {first, second} = testGet(map, key, f);
        assert(first === value);
        assert(second === value);
    }
}
foo();
