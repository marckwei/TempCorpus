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

function testFunction() {
    if (arguments.length !== 10)
        throw "wrong number of arguments expected 10 was " + arguments.length;
    for (let i in arguments) {
        if ((arguments[i] | 0) !== (i | 0))
            throw "argument " + i + " expected " + i + " was " + arguments[i];
    }
}

function testEmpty() {
    if (arguments.length !== 0)
        throw "wrong length expected 0 was " + arguments.length;
}

iter = Array.prototype.values;

function makeObject(array, iterator) {
    let obj = { [Symbol.iterator]: iterator, length: array.length };
    for (let i in array)
        obj[i] = array[i];
    return obj;
}

function otherIterator() {
    return {
        count: 6,
        next: function() {
            if (this.count < 10)
                return { value: this.count++, done: false };
            return { done: true };
        }
    };
}

count = 0;
function* totalIter() {
    for (let i = count; i < count+5; i++) {
        yield i;
    }
    count += 5;
}

function throwingIter() {
     return {
        count: 0,
        next: function() {
            if (this.count < 10)
                return { value: this.count++, done: false };
            throw new Error("this should have been caught");
        }
    };
}

object1 = makeObject([1, 2, 3], iter);
object2 = makeObject([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], iter);
object3 = makeObject([], otherIterator);
object4 = makeObject([], totalIter);
objectThrow = makeObject([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], throwingIter);

for (let i = 0; i < 3000; i++) {
    count = 0;
    testFunction(0, ...[1, 2, 3], ...[4], 5, 6, ...[7, 8, 9]);
    testFunction(...[0, 1], 2, 3, ...[4, 5, 6, 7, 8], 9);
    testFunction(...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    testFunction(0, ...object1, 4, 5, ...[6, 7, 8, 9]);
    testFunction(...object2);
    testFunction(0, ...object1, 4, 5, ...object3);
    testFunction(0, ..."12345", ...object3);
    testEmpty(...[]);
    testFunction(...object4, ...object4);
    testFunction.call(null, 0, ...[1, 2, 3], 4, 5, 6, 7, 8, 9);
    testFunction.apply(null, [0, ...[1, 2, 3], 4, 5, 6, 7, 8, 9])
    let failed = false;
    try {
        testFunction(...objectThrow);
        failed = true;
    } catch (e) {
        if (!e instanceof Error)
            failed = true;
    }
    if (failed)
        throw "did not throw an exeption even though it should have";
}
