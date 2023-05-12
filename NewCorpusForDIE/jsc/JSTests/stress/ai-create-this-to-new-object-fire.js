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

function assert(b, m = "Bad!") {
    if (!b) {
        throw new Error(m);
    }
}

function test(f, iters = 1000) {
    for (let i = 0; i < iters; i++)
        f(i);
}

function func(x) {
    return x;
}
noInline(func);

var n = 2;
var prototype = {};
function prep(index, i, A, B)
{
    if (index === (n - 1) && i === 5000) {
        // Fire watchpoint!
        A.prototype = prototype;
    }
}

function check(index, arr, A, B, originalPrototype)
{
    if (index === (n - 1)) {
        assert(originalPrototype !== prototype);
        for (let i = 0; i < 5000; i++)
            assert(arr[i].__proto__ === originalPrototype);
        for (let i = 5000; i < 10000; i++)
            assert(arr[i].__proto__ === prototype);
    } else {
        for (let i = 0; i < 10000; i++)
            assert(arr[i].__proto__ === originalPrototype);
    }
}
noInline(check);

test(function body(index) {
    function A(x, f = func) {
        this._value = x;
        this._func = f;
    }

    function B(n)
    {
        return new A(n);
    }

    var originalPrototype = A.prototype;
    let arr = [];
    for (let i = 0; i < 10000; i++) {
        prep(index, i, A, B);
        arr.push(B(20));
    }

    check(index, arr, A, B, originalPrototype);
}, n);
