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

function assert(b, ...m) {
    if (!b)
        throw new Error("Bad: ", ...m)
}
noInline(assert);

let shouldBeNewConstructor = false;
const newConstructor = {};

function shallowEq(a, b) {
    assert(a.length === b.length, a, b);
    if (shouldBeNewConstructor)
        assert(b.constructor === newConstructor);
    for (let i = 0; i < a.length; i++)
        assert(a[i] === b[i], a, b);
}
noInline(shallowEq);

let tests = [
    [[1,2,3,4,5], [1,2,3,4,5], 0, 5],
    [[1,2,3,4,5], [1,2,3,4,5], 0],
    [[1,2,3,4,5], [4], -2, -1],
    [[1,2,3,4,5], [5], -1],
    [[1,2,3,4,5], [5], -1, 5],
    [[1,2,3,4,5], [], -10, -20],
    [[1,2,3,4,5], [], -20, -10],
    [[1,2,3,4,5], [], 6, 4],
    [[1,2,3,4,5], [], 3, 2],
    [[1,2,3,4,5], [4,5], 3, 10],
    [[1,2,3,4,5], [3,4,5], 2, 10],
    [[1,2,3,4,5], [1,2,3,4,5], -10, 10],
    [[1,2,3,4,5], [1,2,3,4,5], -5, 10],
    [[1,2,3,4,5], [2,3,4,5], -4, 10],
];

function runTest1(a, b) {
    let result = a.slice(b);
    return result;
}
noInline(runTest1);

function runTest2(a, b, c) {
    let result = a.slice(b, c);
    return result;
}
noInline(runTest2);

function addRandomProperties(input) {
    for (let i = 0; i < 4; i++) {
        input["prop" + i + ((Math.random() * 100000) | 0)] = i;
    }
}
noInline(addRandomProperties);

function runTests() {
    for (let i = 0; i < 10000; i++) {
        for (let [input, output, ...args] of tests) {
            addRandomProperties(input);
            assert(args.length === 1 || args.length === 2);
            if (args.length === 1)
                shallowEq(runTest1(input, args[0]), output);
            else
                shallowEq(runTest2(input, args[0], args[1]), output);
        }
    }
}

runTests();

Array.prototype.constructor = newConstructor;
shouldBeNewConstructor = true;
runTests();
