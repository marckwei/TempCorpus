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

//@ skip if $architecture == "x86" || $buildType == "debug"

function assert(b) {
    if (!b)
        throw new Error("Bad!")
}
noInline(assert);

let calledGet = false;
let definedAccessor = false;
function test() {
    function foo(...rest) {
        return rest;
    }
    noInline(foo);

    for (let i = 0; i < 10000; i++) {
        const size = 800;
        let arr = new Array(size);
        for (let i = 0; i < size; i++)
            arr[i] = i;
        let result = foo(...arr);

        assert(result.length === arr.length);
        assert(result.length === size);
        for (let i = 0; i < arr.length; i++) {
            assert(arr[i] === result[i]);
            assert(result[i] === i);
        }
        if (definedAccessor) {
            calledGet = false;
            result[0];
            assert(!calledGet);
            arr[0];
            assert(calledGet);

            let testArr = [...arr];
            calledGet = false;
            testArr[0];
            assert(!calledGet);
        }
    }
}
test();

definedAccessor = true;
Reflect.defineProperty(Array.prototype, "0", {
    get() { calledGet = true; return 0; },
    set(x) {  }
});
test();
