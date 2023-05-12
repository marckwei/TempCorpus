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

//@ requireOptions("--getByValICMaxNumberOfIdentifiers=2")

let program = `
    function shouldBe(actual, expected) {
        if (actual !== expected)
            throw new Error('bad value: ' + actual);
    }
    noInline(shouldBe);

    function foo(o, p) {
        return o[p];
    }
    noInline(foo);

    function runMono() {
        let o = {
            get x() {
                if ($vm.ftlTrue()) OSRExit();
                return 42;
            }
        };
        for (let i = 0; i < 1000000; ++i) {
            shouldBe(foo(o, "x"), 42);
        }
    }

    function runPoly() {
        let o = {
            a: 1,
            b: 2,
            c: 4,
            d: 4,
            e: 4,
            f: 4,
            g: 4,
        };
        for (let i = 0; i < 1000000; ++i) {
            foo(o, "a");
            foo(o, "b");
            foo(o, "c");
            foo(o, "d");
            foo(o, "e");
            foo(o, "f");
            foo(o, "g");
            foo(o, "h");
            foo(o, "i");
        }
    }
`;

let g1 = runString(program);
g1.runPoly();

let g2 = runString(program);
g2.runMono();
