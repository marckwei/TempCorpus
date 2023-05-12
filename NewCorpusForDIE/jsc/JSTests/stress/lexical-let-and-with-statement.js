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

function truth() {
    return true;
}
noInline(truth);

function assert(cond) {
    if (!cond)
        throw new Error("broke assertion");
}

noInline(assert);

;(function() {
    function foo() {
        let x = 40;
        with ({x : 100}) {
            assert(x === 100);
        }
        with ({y : 100}) {
            assert(x === 40);
        }
    }
    noInline(foo);

    function bar() {
        let x = 40;
        function capX() { return x; }
        with ({x : 100}) {
            if (truth()) {
                let x = 50;
                let capX = function() { return x; }
                assert(x === 50);
                assert(capX() === x);
            }
            assert(x === 100);
            assert(capX() === 40);
        }
        with ({y : 100}) {
            if (truth()) {
                let x = 50;
                let capX = function() { return x; }
                assert(x === 50);
                assert(capX() === x);
            }
            assert(x === 40);
            assert(capX() === 40);
        }
    }
    noInline(bar);

    function baz() {
        let x = 40;
        function capX() { return x; }
        with ({x : 100}) {
            if (truth()) {
                let x = 50;
                assert(x === 50);
            }
            assert(x === 100);
            assert(capX() === 40);
        }
        with ({y : 100}) {
            if (truth()) {
                let x = 50;
                assert(x === 50);
            }
            assert(x === 40);
            assert(capX() === 40);
        }
    }
    noInline(baz);

    for (let i = 0; i < 100; i++) {
        foo();
        bar();
        baz();
    }
})();
