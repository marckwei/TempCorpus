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
        throw new Error("Assertion failure");
}
noInline(assert);

function truth() { return true; }
noInline(truth);

const NUM_LOOPS = 1000;

;(function() {
    function foo() {
        let first;
        let second;
        class A {};
        first = A;
        if (truth()) {
            class A {};
            second = A;
        }
        assert(first !== second);
    }
    function baz() {
        class A { static hello() { return 10; } };
        assert(A.hello() === 10);
        if (truth()) {
            class A { static hello() { return 20; } };
            assert(A.hello() === 20);
        }
        assert(A.hello() === 10);
    }
    function bar() {
        class A { static hello() { return 10; } };
        let capA = function() { return A; }
        assert(A.hello() === 10);
        if (truth()) {
            class A { static hello() { return 20; } };
            let capA = function() { return A; }
            assert(A.hello() === 20);
        }
        assert(A.hello() === 10);
    }
    for (let i = 0; i < NUM_LOOPS; i++) {
        foo();
        bar();
        baz();
    }
})();
