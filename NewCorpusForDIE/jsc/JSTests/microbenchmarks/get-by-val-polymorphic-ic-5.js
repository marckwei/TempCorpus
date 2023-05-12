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

//@ $skipModes << :lockdown if $buildType == "debug"

function assert(b, m) {
    if (!b)
        throw new Error(m);
}

function test5() {
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

    let o1 = new Uint8Array([1, 2]);
    let o2 = new Uint32Array([3, 4]);
    let o3 = new Int32Array([5, 6]);
    let o4 = new Float32Array([7, 8]);

    let start = Date.now();
    for (let i = 0; i < 8000000; ++i) {
        assert(foo(o1, 0) === 1);
        assert(foo(o1, 1) === 2);
        assert(foo(o2, 0) === 3);
        assert(foo(o2, 1) === 4);
        assert(foo(o3, 0) === 5);
        assert(foo(o3, 1) === 6);
        assert(foo(o4, 0) === 7);
        assert(foo(o4, 1) === 8);
    }
}
test5();
