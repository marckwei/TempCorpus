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
        throw new Error;
}

function doTest(o, m) {
    let error;
    try {
        o[m]();
    } catch(e) {
        error = e;
    }

    assert(!!error);
    assert(error instanceof SyntaxError);
    assert(error.message.startsWith("Cannot reference undeclared private names"));
}

class C {
    #y;
    #method2() { }
    constructor() { }
    a() { eval('this.#x;'); }
    b() { eval('this.#method();'); }
}

for (let i = 0; i < 1000; ++i) { 
    let c = new C();
    doTest(c, "a");
    doTest(c, "b");
}

class D {
    #y;
    #method2() { }
    constructor() { }
    a() {
        class C {
            #y2;
            #method3() { }
            a() { 
                eval('this.#x;');
            }
        }

        let x = new C;
        x.a();
    }

    b() {
        class C {
            #y2;
            #method3() { }
            a() { 
                eval('this.#method();'); 
            }
        }

        let x = new C;
        x.a();
    }
}

for (let i = 0; i < 1000; ++i) {
    let d = new D();
    doTest(d, "a");
    doTest(d, "b");
}
