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

//@ skip if $memoryLimited
//@ if $buildType == "release" then runDefault else skip end

function shouldThrowStackOverflow(fn) {
    let caught;
    try {
        fn();
    } catch (error) {
        caught = error;
    }

    if (!caught)
        throw new Error("Did not throw");
    if (String(caught) !== "RangeError: Maximum call stack size exceeded.")
        throw new Error(`Expected stack overflow error, but got: ${caught}`);
}

{
    const obj = {};
    for (let nextObj = obj, i = 0; i < 1e6; ++i)
        nextObj = nextObj[`k${i}`] = {};

    shouldThrowStackOverflow(() => {
        JSON.stringify(obj);
    });

    shouldThrowStackOverflow(() => {
        JSON.stringify([1, 2, [obj]]);
    });
}

{
    const arr = {};
    for (let nextArr = arr, i = 0; i < 1e6; ++i)
        nextArr = nextArr[0] = [];

    shouldThrowStackOverflow(() => {
        JSON.stringify(arr);
    });

    shouldThrowStackOverflow(() => {
        JSON.stringify({a: {b: arr}});
    });
}

{
    const obj = {
        toJSON() {
            return {key: obj};
        },
    };

    shouldThrowStackOverflow(() => {
        JSON.stringify(obj);
    });

    shouldThrowStackOverflow(() => {
        JSON.stringify({a: {b: obj}});
    });
}

{
    const arr = [];
    arr.toJSON = () => [arr];

    shouldThrowStackOverflow(() => {
        JSON.stringify(arr);
    });

    shouldThrowStackOverflow(() => {
        JSON.stringify([[1, 2, arr]]);
    });
}

{
    const obj = {};

    shouldThrowStackOverflow(() => {
        JSON.stringify(null, () => {
            return {key: obj};
        });
    });

    shouldThrowStackOverflow(() => {
        JSON.stringify({a: {b: 1}}, (key, val) => {
            return key === "b" ? {b: obj} : val;
        });
    });
}

{
    const arr = [];

    shouldThrowStackOverflow(() => {
        JSON.stringify(null, () => {
            return [arr];
        });
    });

    shouldThrowStackOverflow(() => {
        JSON.stringify([[1, 2, 3]], (key, val) => {
            return key === "2" ? [1, 2, arr] : val;
        });
    });
}
