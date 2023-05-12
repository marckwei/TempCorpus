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

function assert(b, m) {
    if (!b)
        throw new Error(m);
}

function test6() {
    function foo(o, i) {
        return o[i];
    }
    noInline(foo);

    function args(a, b) {
        function capture() { 
            return a + b;
        }
        return arguments;
    }

    let o1 = "abc";
    let o2 = "\u2713a";
    let o3 = new Uint32Array([3, 4]);

    let start = Date.now();
    for (let i = 0; i < 2000000; ++i) {
        assert(foo(o1, 0) === "a");
        assert(foo(o1, 1) === "b");
        assert(foo(o1, 2) === "c");
        assert(foo(o2, 0) === "\u2713");
        assert(foo(o2, 1) === "a");
        assert(foo(o3, 0) === 3);
        assert(foo(o3, 1) === 4);
    }
}
test6();
